import { DbColumn, DbRelation, DbSchema, DbTable, SampleTemplate } from './db-viewer.models';

export class DbSchemaParser {

  /**
   * Cleans quotes, backticks or brackets around identifiers: `user`, [orders], "items" -> user, orders, items
   */
  private static cleanIdentifier(str: string): string {
    if (!str) return '';
    return str.trim().replace(/^[`"\[]|[`"\]]$/g, '');
  }

  /**
   * Main parsing entry point: supports SQL DDL, JSON or simplified syntax
   */
  public static parse(input: string): DbSchema {
    const trimmed = input.trim();
    if (!trimmed) {
      return {
        tables: [],
        relations: [],
        summary: {
          totalTables: 0,
          totalColumns: 0,
          totalRelations: 0,
          oneToOneCount: 0,
          oneToManyCount: 0,
          manyToManyCount: 0
        }
      };
    }

    // Try parsing as JSON first if it looks like JSON
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const json = JSON.parse(trimmed);
        const schema = this.parseJsonSchema(json);
        if (schema.tables.length > 0) return schema;
      } catch {
        // Fallback to SQL parsing
      }
    }

    return this.parseSqlDdl(trimmed);
  }

  /**
   * Parses SQL DDL statements (CREATE TABLE, ALTER TABLE ADD CONSTRAINT, etc.)
   */
  private static parseSqlDdl(sql: string): DbSchema {
    // 1. Remove single-line comments (-- ... or # ...) and multi-line comments (/* ... */)
    let cleaned = sql
      .replace(/--.*$/gm, '')
      .replace(/#.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');

    const tableMap = new Map<string, DbTable>();
    const pendingFks: Array<{
      sourceTable: string;
      sourceColumn: string;
      targetTable: string;
      targetColumn: string;
      constraintName?: string;
    }> = [];

    // 2. Extract CREATE TABLE blocks using balanced parenthesis parser
    const createTableKeywordRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"\[\w\.\-]+)\s*\(/gi;
    let match: RegExpExecArray | null;

    while ((match = createTableKeywordRegex.exec(cleaned)) !== null) {
      const rawTableName = match[1];
      const tableName = this.cleanIdentifier(rawTableName.split('.').pop() || rawTableName);

      const startIdx = match.index + match[0].length;
      let depth = 1;
      let inQuote: string | null = null;
      let endIdx = -1;

      for (let i = startIdx; i < cleaned.length; i++) {
        const ch = cleaned[i];
        if (inQuote) {
          if (ch === inQuote && cleaned[i - 1] !== '\\') {
            inQuote = null;
          }
          continue;
        }
        if (ch === "'" || ch === '"' || ch === '`') {
          inQuote = ch;
          continue;
        }
        if (ch === '(') {
          depth++;
        } else if (ch === ')') {
          depth--;
          if (depth === 0) {
            endIdx = i;
            break;
          }
        }
      }

      if (endIdx === -1) {
        continue;
      }

      // Fast forward regex pointer to search after this table's closing parenthesis
      createTableKeywordRegex.lastIndex = endIdx + 1;

      const body = cleaned.substring(startIdx, endIdx);

      const columns: DbColumn[] = [];
      const tablePks = new Set<string>();
      const tableUniques = new Set<string>();

      // Split body by commas that are NOT inside parentheses
      const statements = this.splitByTopLevelCommas(body);

      for (const rawStmt of statements) {
        const stmt = rawStmt.trim();
        if (!stmt) continue;

        // Check for table-level PRIMARY KEY (col1, col2...)
        const pkMatch = stmt.match(/^(?:CONSTRAINT\s+[`"\[\w\-]+\]?\s+)?PRIMARY\s+KEY\s*\((.*?)\)/i);
        if (pkMatch) {
          const pkCols = pkMatch[1].split(',').map(c => this.cleanIdentifier(c));
          pkCols.forEach(col => tablePks.add(col.toLowerCase()));
          continue;
        }

        // Check for table-level UNIQUE (col1, col2...)
        const uniqueMatch = stmt.match(/^(?:CONSTRAINT\s+[`"\[\w\-]+\]?\s+)?UNIQUE(?:\s+KEY|\s+INDEX)?(?:\s+[`"\[\w\-]+\]?)?\s*\((.*?)\)/i);
        if (uniqueMatch) {
          const uqCols = uniqueMatch[1].split(',').map(c => this.cleanIdentifier(c));
          if (uqCols.length === 1) {
            tableUniques.add(uqCols[0].toLowerCase());
          }
          continue;
        }

        // Check for table-level FOREIGN KEY
        const fkMatch = stmt.match(/^(?:CONSTRAINT\s+([`"\[\w\-]+\]?)\s+)?FOREIGN\s+KEY\s*(?:[`"\[\w\-]+\]?)?\s*\((.*?)\)\s*REFERENCES\s+([`"\[\w\.\-]+)\s*\((.*?)\)/i);
        if (fkMatch) {
          const constraintName = fkMatch[1] ? this.cleanIdentifier(fkMatch[1]) : undefined;
          const srcCol = this.cleanIdentifier(fkMatch[2]);
          const targetTable = this.cleanIdentifier(fkMatch[3].split('.').pop() || fkMatch[3]);
          const targetCol = this.cleanIdentifier(fkMatch[4]);

          pendingFks.push({
            sourceTable: tableName,
            sourceColumn: srcCol,
            targetTable,
            targetColumn: targetCol,
            constraintName
          });
          continue;
        }

        // Check for INDEX or KEY declarations (skip standard non-unique keys)
        if (/^(?:KEY|INDEX|FULLTEXT|SPATIAL|CHECK)/i.test(stmt)) {
          continue;
        }

        // Otherwise, it's a Column Definition!
        // Format: col_name data_type(args) [constraints...]
        const colDef = this.parseColumnDefinition(stmt, tableName, pendingFks);
        if (colDef) {
          columns.push(colDef);
        }
      }

      // Apply table-level constraints to columns
      for (const col of columns) {
        const lowerName = col.name.toLowerCase();
        if (tablePks.has(lowerName)) {
          col.isPrimaryKey = true;
          col.isNullable = false;
        }
        if (tableUniques.has(lowerName)) {
          col.isUnique = true;
        }
      }

      tableMap.set(tableName.toLowerCase(), {
        id: tableName,
        name: tableName,
        columns,
        x: 0,
        y: 0
      });
    }

    // 3. Extract standalone ALTER TABLE ... ADD CONSTRAINT ... FOREIGN KEY ...
    const alterFkRegex = /ALTER\s+TABLE\s+([`"\[\w\.\-]+)\s+ADD\s+(?:CONSTRAINT\s+([`"\[\w\-]+\]?)\s+)?FOREIGN\s+KEY\s*(?:[`"\[\w\-]+\]?)?\s*\((.*?)\)\s*REFERENCES\s+([`"\[\w\.\-]+)\s*\((.*?)\)/gi;
    let alterMatch: RegExpExecArray | null;

    while ((alterMatch = alterFkRegex.exec(cleaned)) !== null) {
      const srcTable = this.cleanIdentifier(alterMatch[1].split('.').pop() || alterMatch[1]);
      const constraintName = alterMatch[2] ? this.cleanIdentifier(alterMatch[2]) : undefined;
      const srcCol = this.cleanIdentifier(alterMatch[3]);
      const targetTable = this.cleanIdentifier(alterMatch[4].split('.').pop() || alterMatch[4]);
      const targetCol = this.cleanIdentifier(alterMatch[5]);

      pendingFks.push({
        sourceTable: srcTable,
        sourceColumn: srcCol,
        targetTable,
        targetColumn: targetCol,
        constraintName
      });
    }

    // 4. Mark isForeignKey on columns & resolve relations with Cardinality
    const tables = Array.from(tableMap.values());
    const relations: DbRelation[] = [];

    // Helper to find table case-insensitively
    const findTable = (name: string): DbTable | undefined => {
      return tableMap.get(name.toLowerCase());
    };

    for (const fk of pendingFks) {
      const srcTable = findTable(fk.sourceTable);
      const tgtTable = findTable(fk.targetTable);

      if (srcTable) {
        const col = srcTable.columns.find(c => c.name.toLowerCase() === fk.sourceColumn.toLowerCase());
        if (col) {
          col.isForeignKey = true;
          col.references = {
            table: tgtTable ? tgtTable.name : fk.targetTable,
            column: fk.targetColumn
          };
        }
      }

      // Determine Cardinality (1:1 vs 1:N)
      let cardinality: '1:1' | '1:N' = '1:N';
      if (srcTable) {
        const col = srcTable.columns.find(c => c.name.toLowerCase() === fk.sourceColumn.toLowerCase());
        // If the foreign key column is also marked UNIQUE or is the only PRIMARY KEY of the source table,
        // then each row in source table can reference at most ONE row in target and vice versa -> 1:1
        if (col && (col.isUnique || (col.isPrimaryKey && srcTable.columns.filter(c => c.isPrimaryKey).length === 1))) {
          cardinality = '1:1';
        }
      }

      relations.push({
        id: `${fk.sourceTable}_${fk.sourceColumn}->${fk.targetTable}_${fk.targetColumn}`,
        sourceTable: srcTable ? srcTable.name : fk.sourceTable,
        sourceColumn: fk.sourceColumn,
        targetTable: tgtTable ? tgtTable.name : fk.targetTable,
        targetColumn: fk.targetColumn,
        cardinality,
        constraintName: fk.constraintName,
        description: cardinality === '1:1'
          ? `Relación Uno a Uno (1:1) entre ${fk.sourceTable} y ${fk.targetTable}`
          : `Relación Uno a Muchos (1:N): ${fk.targetTable} tiene muchos ${fk.sourceTable}`
      });
    }

    // 5. Detect Many-to-Many (N:M) Junction / Pivot tables
    this.detectManyToManyRelations(tables, relations);

    // 6. Calculate initial smart layout positions for tables
    this.computeAutoLayout(tables);

    // 7. Calculate summary metrics
    const oneToOneCount = relations.filter(r => r.cardinality === '1:1').length;
    const oneToManyCount = relations.filter(r => r.cardinality === '1:N').length;
    const manyToManyCount = relations.filter(r => r.cardinality === 'N:M').length;
    const totalColumns = tables.reduce((acc, t) => acc + t.columns.length, 0);

    return {
      tables,
      relations,
      summary: {
        totalTables: tables.length,
        totalColumns,
        totalRelations: relations.length,
        oneToOneCount,
        oneToManyCount,
        manyToManyCount
      }
    };
  }

  /**
   * Parses a single column definition string
   */
  private static parseColumnDefinition(
    stmt: string,
    tableName: string,
    pendingFks: Array<{ sourceTable: string; sourceColumn: string; targetTable: string; targetColumn: string; constraintName?: string }>
  ): DbColumn | null {
    // E.g.: id INT AUTO_INCREMENT PRIMARY KEY NOT NULL
    // or: user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE
    const colMatch = stmt.match(/^([`"\[\w\-]+\]?)\s+([A-Za-z0-9_]+(?:\s*\([^)]+\))?(?:\s+unsigned|\s+zerofill)?)([\s\S]*)$/i);
    if (!colMatch) return null;

    const name = this.cleanIdentifier(colMatch[1]);
    const type = colMatch[2].trim().toUpperCase();
    const rest = colMatch[3] || '';

    const isPrimaryKey = /PRIMARY\s+KEY/i.test(rest);
    const isUnique = /UNIQUE/i.test(rest);
    const isNullable = !/NOT\s+NULL/i.test(rest) && !isPrimaryKey;

    // Default value
    let defaultValue: string | undefined;
    const defaultMatch = rest.match(/DEFAULT\s+([^,\s]+|'[^']*'|"[^"]*")/i);
    if (defaultMatch) {
      defaultValue = defaultMatch[1].replace(/^['"]|['"]$/g, '');
    }

    // Inline REFERENCES
    const inlineRef = rest.match(/REFERENCES\s+([`"\[\w\.\-]+)\s*\((.*?)\)/i);
    if (inlineRef) {
      const targetTable = this.cleanIdentifier(inlineRef[1].split('.').pop() || inlineRef[1]);
      const targetCol = this.cleanIdentifier(inlineRef[2]);
      pendingFks.push({
        sourceTable: tableName,
        sourceColumn: name,
        targetTable,
        targetColumn: targetCol
      });
    }

    return {
      name,
      type,
      isPrimaryKey,
      isForeignKey: !!inlineRef,
      isUnique,
      isNullable,
      defaultValue
    };
  }

  /**
   * Splits table body by commas, ignoring commas nested inside parentheses ()
   */
  private static splitByTopLevelCommas(str: string): string[] {
    const result: string[] = [];
    let depth = 0;
    let current = '';

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '(') depth++;
      else if (char === ')') depth--;

      if (char === ',' && depth === 0) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) {
      result.push(current);
    }
    return result;
  }

  /**
   * Identifies junction/pivot tables that represent a Many-to-Many relationship
   */
  private static detectManyToManyRelations(tables: DbTable[], relations: DbRelation[]): void {
    for (const table of tables) {
      // Find all FKs outgoing from this table
      const outgoingFks = relations.filter(r => r.sourceTable.toLowerCase() === table.name.toLowerCase());

      // A table is considered a junction table if:
      // 1. It has exactly or at least 2 foreign keys pointing to different tables
      // 2. The table is relatively small (typically <= 5 columns, or foreign keys form the primary key)
      if (outgoingFks.length >= 2) {
        const uniqueTargets = new Set(outgoingFks.map(r => r.targetTable.toLowerCase()));
        if (uniqueTargets.size >= 2 && table.columns.length <= 6) {
          table.isJunctionTable = true;

          // For the first pair of foreign keys pointing to different tables, register a conceptual N:M relation
          const fk1 = outgoingFks[0];
          const fk2 = outgoingFks[1];

          if (fk1.targetTable.toLowerCase() !== fk2.targetTable.toLowerCase()) {
            relations.push({
              id: `nm_${fk1.targetTable}_${table.name}_${fk2.targetTable}`,
              sourceTable: fk1.targetTable,
              sourceColumn: fk1.targetColumn,
              targetTable: fk2.targetTable,
              targetColumn: fk2.targetColumn,
              cardinality: 'N:M',
              junctionTable: table.name,
              description: `Relación Muchos a Muchos (N:M) entre ${fk1.targetTable} y ${fk2.targetTable} (vía tabla intermedia '${table.name}')`
            });
          }
        }
      }
    }
  }

  /**
   * Generates balanced, non-overlapping coordinates for tables on canvas
   */
  public static computeAutoLayout(tables: DbTable[]): void {
    const colsCount = Math.max(1, Math.min(3, Math.ceil(Math.sqrt(tables.length))));
    const cardWidth = 280;
    const horizontalGap = 160;
    const verticalGap = 70;
    const startX = 60;
    const startY = 60;

    const columnHeights: number[] = new Array(colsCount).fill(startY);

    tables.forEach((table, index) => {
      // Choose the column with minimum current height
      let chosenCol = 0;
      let minHeight = columnHeights[0];
      for (let c = 1; c < colsCount; c++) {
        if (columnHeights[c] < minHeight) {
          minHeight = columnHeights[c];
          chosenCol = c;
        }
      }

      const x = startX + chosenCol * (cardWidth + horizontalGap);
      const y = columnHeights[chosenCol];

      table.x = x;
      table.y = y;

      // Estimate card height: header (50px) + ~34px per column + footer padding (20px)
      const estimatedHeight = 50 + table.columns.length * 34 + 20;
      table.width = cardWidth;
      table.height = estimatedHeight;

      columnHeights[chosenCol] += estimatedHeight + verticalGap;
    });
  }

  /**
   * Parses JSON schema format if provided
   */
  private static parseJsonSchema(json: any): DbSchema {
    const rawTables = Array.isArray(json) ? json : (json.tables || []);
    const tables: DbTable[] = [];
    const relations: DbRelation[] = [];

    for (const raw of rawTables) {
      if (!raw || !raw.name) continue;
      const columns: DbColumn[] = (raw.columns || []).map((c: any) => ({
        name: c.name || 'unnamed',
        type: (c.type || 'VARCHAR').toUpperCase(),
        isPrimaryKey: !!c.isPrimaryKey || !!c.pk,
        isForeignKey: !!c.isForeignKey || !!c.fk || !!c.references,
        isUnique: !!c.isUnique,
        isNullable: c.isNullable !== undefined ? c.isNullable : !c.pk,
        defaultValue: c.defaultValue,
        references: c.references ? {
          table: c.references.table,
          column: c.references.column || 'id'
        } : undefined
      }));

      tables.push({
        id: raw.name,
        name: raw.name,
        columns,
        x: raw.x || 0,
        y: raw.y || 0
      });
    }

    // Build relations from columns
    for (const table of tables) {
      for (const col of table.columns) {
        if (col.references) {
          const cardinality = (col.isUnique || col.isPrimaryKey) ? '1:1' : '1:N';
          relations.push({
            id: `${table.name}_${col.name}->${col.references.table}_${col.references.column}`,
            sourceTable: table.name,
            sourceColumn: col.name,
            targetTable: col.references.table,
            targetColumn: col.references.column,
            cardinality,
            description: cardinality === '1:1'
              ? `Relación Uno a Uno (1:1) entre ${table.name} y ${col.references.table}`
              : `Relación Uno a Muchos (1:N): ${col.references.table} tiene muchos ${table.name}`
          });
        }
      }
    }

    this.detectManyToManyRelations(tables, relations);
    this.computeAutoLayout(tables);

    const oneToOneCount = relations.filter(r => r.cardinality === '1:1').length;
    const oneToManyCount = relations.filter(r => r.cardinality === '1:N').length;
    const manyToManyCount = relations.filter(r => r.cardinality === 'N:M').length;

    return {
      tables,
      relations,
      summary: {
        totalTables: tables.length,
        totalColumns: tables.reduce((acc, t) => acc + t.columns.length, 0),
        totalRelations: relations.length,
        oneToOneCount,
        oneToManyCount,
        manyToManyCount
      }
    };
  }

  /**
   * Pre-packaged rich SQL examples demonstrating 1:1, 1:N and N:M
   */
  public static getSampleTemplates(): SampleTemplate[] {
    return [
      {
        id: 'ecommerce',
        name: 'Tienda Online (E-Commerce)',
        category: 'Comercio',
        description: 'Muestra usuarios, pedidos, productos con tabla intermedia de detalle (N:M) y pagos (1:1).',
        sql: `-- Esquema E-Commerce PortaLink
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE perfiles_usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL UNIQUE,
    bio TEXT,
    avatar_url VARCHAR(255),
    direccion VARCHAR(200),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(80) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    descripcion TEXT
);

CREATE TABLE productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    categoria_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE pedidos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    numero_orden VARCHAR(50) UNIQUE NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(30) DEFAULT 'pendiente',
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE detalles_pedido (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE pagos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT NOT NULL UNIQUE,
    metodo VARCHAR(50) NOT NULL,
    transaccion_ref VARCHAR(100) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    pagado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);`
      },
      {
        id: 'saas',
        name: 'Plataforma SaaS & Permisos',
        category: 'Software',
        description: 'Tenants/Empresas, Usuarios, Roles con tabla pivote de asignación (N:M) y suscripciones activas (1:1).',
        sql: `-- Esquema Multi-inquilino (SaaS)
CREATE TABLE empresas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(120) NOT NULL,
    nit VARCHAR(30) UNIQUE,
    subdominio VARCHAR(50) UNIQUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suscripciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL UNIQUE,
    plan VARCHAR(50) NOT NULL,
    estado VARCHAR(30) DEFAULT 'activo',
    fecha_inicio DATE NOT NULL,
    fecha_renovacion DATE,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(200)
);

CREATE TABLE miembros (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL,
    cargo VARCHAR(80),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE TABLE miembro_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    miembro_id INT NOT NULL,
    role_id INT NOT NULL,
    asignado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (miembro_id) REFERENCES miembros(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE auditorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    miembro_id INT NOT NULL,
    accion VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (miembro_id) REFERENCES miembros(id)
);`
      },
      {
        id: 'social',
        name: 'Blog & Red Social',
        category: 'Contenido',
        description: 'Autores, Artículos, Etiquetas (Tags) con relación N:M y comentarios moderados.',
        sql: `-- Esquema de Publicaciones y Etiquetas
CREATE TABLE autores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    nickname VARCHAR(50) UNIQUE NOT NULL,
    sitio_web VARCHAR(200),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE articulos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    autor_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    slug VARCHAR(220) UNIQUE NOT NULL,
    contenido LONGTEXT NOT NULL,
    visitas INT DEFAULT 0,
    publicado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (autor_id) REFERENCES autores(id)
);

CREATE TABLE etiquetas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    color_hex VARCHAR(10) DEFAULT '#0ea5e9'
);

CREATE TABLE articulo_etiquetas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    articulo_id INT NOT NULL,
    etiqueta_id INT NOT NULL,
    FOREIGN KEY (articulo_id) REFERENCES articulos(id) ON DELETE CASCADE,
    FOREIGN KEY (etiqueta_id) REFERENCES etiquetas(id) ON DELETE CASCADE
);

CREATE TABLE comentarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    articulo_id INT NOT NULL,
    nombre_autor VARCHAR(80) NOT NULL,
    mensaje TEXT NOT NULL,
    aprobado BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (articulo_id) REFERENCES articulos(id) ON DELETE CASCADE
);`
      }
    ];
  }
}
