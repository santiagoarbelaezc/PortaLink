export type CardinalityType = '1:1' | '1:N' | 'N:M';

export interface DbColumn {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isUnique: boolean;
  isNullable: boolean;
  defaultValue?: string;
  references?: {
    table: string;
    column: string;
  };
}

export interface DbTable {
  id: string;
  name: string;
  comment?: string;
  columns: DbColumn[];
  x: number;
  y: number;
  width?: number;
  height?: number;
  isJunctionTable?: boolean; // N:M pivot table
}

export interface DbRelation {
  id: string;
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  cardinality: CardinalityType;
  constraintName?: string;
  junctionTable?: string; // If this relation was detected through a N:M pivot table
  description?: string;
}

export interface DbSchema {
  tables: DbTable[];
  relations: DbRelation[];
  summary: {
    totalTables: number;
    totalColumns: number;
    totalRelations: number;
    oneToOneCount: number;
    oneToManyCount: number;
    manyToManyCount: number;
  };
}

export interface SampleTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  sql: string;
}
