import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface NotebookFolder {
  id?: number;
  user_id?: number;
  name: string;
  description?: string;
  color: string;
  icon: string;
  order_index?: number;
  notebook_count?: number;
  pages_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface NotebookModule {
  id?: number;
  folder_id: number;
  user_id?: number;
  title: string;
  description?: string;
  color: string;
  icon: string;
  is_favorite?: boolean | number;
  order_index?: number;
  folder_name?: string;
  folder_color?: string;
  pages_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface NotebookPage {
  id?: number;
  notebook_id: number;
  title: string;
  slug?: string;
  content?: string;
  tags?: string;
  is_pinned?: boolean | number;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/library`;

  // ── Carpetas (Nivel 1) ──────────────────────────────────
  getFolders(): Observable<{ ok: boolean; data: NotebookFolder[] }> {
    return this.http.get<{ ok: boolean; data: NotebookFolder[] }>(`${this.apiUrl}/folders`);
  }

  createFolder(folder: Partial<NotebookFolder>): Observable<{ ok: boolean; message: string; data: NotebookFolder }> {
    return this.http.post<{ ok: boolean; message: string; data: NotebookFolder }>(`${this.apiUrl}/folders`, folder);
  }

  updateFolder(id: number, folder: Partial<NotebookFolder>): Observable<{ ok: boolean; message: string; data: NotebookFolder }> {
    return this.http.put<{ ok: boolean; message: string; data: NotebookFolder }>(`${this.apiUrl}/folders/${id}`, folder);
  }

  deleteFolder(id: number): Observable<{ ok: boolean; message: string }> {
    return this.http.delete<{ ok: boolean; message: string }>(`${this.apiUrl}/folders/${id}`);
  }

  // ── Cuadernos (Nivel 2) ──────────────────────────────────
  getNotebooks(folderId?: number): Observable<{ ok: boolean; data: NotebookModule[] }> {
    let params = new HttpParams();
    if (folderId) {
      params = params.set('folder_id', folderId.toString());
    }
    return this.http.get<{ ok: boolean; data: NotebookModule[] }>(`${this.apiUrl}/notebooks`, { params });
  }

  createNotebook(notebook: Partial<NotebookModule>): Observable<{ ok: boolean; message: string; data: NotebookModule }> {
    return this.http.post<{ ok: boolean; message: string; data: NotebookModule }>(`${this.apiUrl}/notebooks`, notebook);
  }

  updateNotebook(id: number, notebook: Partial<NotebookModule>): Observable<{ ok: boolean; message: string; data: NotebookModule }> {
    return this.http.put<{ ok: boolean; message: string; data: NotebookModule }>(`${this.apiUrl}/notebooks/${id}`, notebook);
  }

  deleteNotebook(id: number): Observable<{ ok: boolean; message: string }> {
    return this.http.delete<{ ok: boolean; message: string }>(`${this.apiUrl}/notebooks/${id}`);
  }

  // ── Apuntes / Páginas (Nivel 3) ──────────────────────────
  getPages(notebookId: number): Observable<{ ok: boolean; data: NotebookPage[] }> {
    const params = new HttpParams().set('notebook_id', notebookId.toString());
    return this.http.get<{ ok: boolean; data: NotebookPage[] }>(`${this.apiUrl}/pages`, { params });
  }

  createPage(page: Partial<NotebookPage>): Observable<{ ok: boolean; message: string; data: NotebookPage }> {
    return this.http.post<{ ok: boolean; message: string; data: NotebookPage }>(`${this.apiUrl}/pages`, page);
  }

  updatePage(id: number, page: Partial<NotebookPage>): Observable<{ ok: boolean; message: string; data: NotebookPage }> {
    return this.http.put<{ ok: boolean; message: string; data: NotebookPage }>(`${this.apiUrl}/pages/${id}`, page);
  }

  deletePage(id: number): Observable<{ ok: boolean; message: string }> {
    return this.http.delete<{ ok: boolean; message: string }>(`${this.apiUrl}/pages/${id}`);
  }

  // ── Buscador Global ──────────────────────────────────────
  search(query: string): Observable<{ ok: boolean; data: any[] }> {
    const params = new HttpParams().set('q', query);
    return this.http.get<{ ok: boolean; data: any[] }>(`${this.apiUrl}/search`, { params });
  }
}
