import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface UserSite {
  id: number;
  slug: string;
  site_data: any;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SiteService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private buildHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }
    return new HttpHeaders();
  }

  getMySite(): Observable<{ site: UserSite | null }> {
    return this.http.get<{ site: UserSite | null }>(
      `${environment.apiUrl}/site/my`,
      { headers: this.buildHeaders() }
    );
  }

  getSiteBySlug(slug: string): Observable<{ site: UserSite }> {
    return this.http.get<{ site: UserSite }>(
      `${environment.apiUrl}/site/${slug}`
    );
  }
}
