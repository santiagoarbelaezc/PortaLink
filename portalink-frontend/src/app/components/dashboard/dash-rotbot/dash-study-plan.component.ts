import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RobotChatService, StudyMaterial, CEFRLevel, MaterialCategory, RotbotMode } from '../../../services/robot-chat.service';

@Component({
  selector: 'app-dash-study-plan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5 tab-enter font-sans overflow-x-hidden p-1 sm:p-2">

      <!-- ══════════════════════════════════════════════════════════════
           1. CLEAN EXECUTIVE HEADER (ENGLISH & COMPACT)
      ══════════════════════════════════════════════════════════════ -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4"
           [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
        
        <!-- TITLE -->
        <div class="flex items-center gap-3">
          <span class="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
            </svg>
          </span>
          <div>
            <h2 class="text-xl sm:text-2xl font-headline font-bold tracking-tight"
                [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
              Study Plans & Syllabus
            </h2>
            <p class="text-xs text-neutral-400">
              <span *ngIf="activeMaterial" class="text-cyan-400 font-semibold">Active: {{ activeMaterial.title }} ({{ activeMaterial.level }})</span>
              <span *ngIf="!activeMaterial">No plan active (Rotbot practices in free conversation)</span>
            </p>
          </div>
        </div>

        <!-- CONTROLS & ACTIONS -->
        <div class="flex items-center gap-2.5 flex-wrap">
          
          <!-- SEARCH INPUT -->
          <div class="relative min-w-[180px] sm:min-w-[220px]">
            <input 
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search lessons..."
              class="w-full pl-8 pr-3 py-2 text-xs rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              [ngClass]="isDark ? 'bg-neutral-900/80 border-neutral-800 text-white placeholder:text-neutral-500' : 'bg-neutral-100/80 border-neutral-200 text-neutral-900 placeholder:text-neutral-400'"
            />
            <svg class="w-3.5 h-3.5 absolute left-3 top-2.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>

          <!-- NEW LESSON BUTTON -->
          <button 
            (click)="createNewMaterial()"
            class="px-4 py-2 rounded-full text-xs font-headline font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-[#09090b] text-white hover:bg-neutral-800'"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
            <span>New Lesson</span>
          </button>

          <!-- PRACTICE IN CHAT BUTTON -->
          <button 
            (click)="switchMode.emit('charla')"
            class="px-4 py-2 rounded-full text-xs font-headline font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-md bg-cyan-500 text-black hover:bg-cyan-400 hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            <span>Practice in Chat</span>
          </button>

        </div>
      </div>

      <!-- TOAST FEEDBACK -->
      <div *ngIf="toastMessage" 
           class="p-3.5 rounded-2xl border flex items-center justify-between shadow-lg transition-all animate-fadeIn"
           [ngClass]="toastType === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'">
        <div class="flex items-center gap-2.5">
          <span class="w-2 h-2 rounded-full" [ngClass]="toastType === 'error' ? 'bg-red-400' : 'bg-emerald-400'"></span>
          <span class="text-xs font-headline font-bold uppercase tracking-wider">{{ toastMessage }}</span>
        </div>
        <button (click)="toastMessage = ''" class="text-xs opacity-70 hover:opacity-100 cursor-pointer">✕</button>
      </div>

      <!-- ══════════════════════════════════════════════════════════════
           2. COMPACT KPI METRICS (ENGLISH)
      ══════════════════════════════════════════════════════════════ -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

        <!-- 1. Total Lessons -->
        <div class="rounded-2xl border p-3.5 sm:p-4 space-y-1.5 transition-all duration-200 group hover:border-neutral-500"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-headline font-semibold uppercase tracking-wider opacity-60">Total Lessons</span>
            <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-cyan-500/30 text-cyan-400 bg-cyan-500/10">
              Database
            </span>
          </div>
          <p class="text-lg sm:text-xl font-headline font-bold tracking-tight" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
            {{ materials.length }} Plans
          </p>
        </div>

        <!-- 2. Grammar -->
        <div class="rounded-2xl border p-3.5 sm:p-4 space-y-1.5 transition-all duration-200 group hover:border-neutral-500"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-headline font-semibold uppercase tracking-wider opacity-60">Grammar</span>
            <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
              Rules
            </span>
          </div>
          <p class="text-lg sm:text-xl font-headline font-bold tracking-tight text-emerald-400">
            {{ grammarCount }} Modules
          </p>
        </div>

        <!-- 3. Vocabulary -->
        <div class="rounded-2xl border p-3.5 sm:p-4 space-y-1.5 transition-all duration-200 group hover:border-neutral-500"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-headline font-semibold uppercase tracking-wider opacity-60">Vocabulary</span>
            <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-blue-500/30 text-blue-400 bg-blue-500/10">
              Words
            </span>
          </div>
          <p class="text-lg sm:text-xl font-headline font-bold tracking-tight text-blue-400">
            {{ vocabCount }} Sets
          </p>
        </div>

        <!-- 4. Reading & Songs -->
        <div class="rounded-2xl border p-3.5 sm:p-4 space-y-1.5 transition-all duration-200 group hover:border-neutral-500"
             [ngClass]="isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80'">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-headline font-semibold uppercase tracking-wider opacity-60">Reading & Songs</span>
            <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-purple-500/30 text-purple-400 bg-purple-500/10">
              Immersion
            </span>
          </div>
          <p class="text-lg sm:text-xl font-headline font-bold tracking-tight text-purple-400">
            {{ immersionCount }} Units
          </p>
        </div>

      </div>

      <!-- ══════════════════════════════════════════════════════════════
           3. CONCISE FILTER BAR (ENGLISH & CLEAN)
      ══════════════════════════════════════════════════════════════ -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 p-3 rounded-2xl border transition-all"
           [ngClass]="isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-neutral-200/90'">
        
        <!-- CEFR Level Filters -->
        <div class="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <span class="text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-500 mr-1.5 shrink-0">Level:</span>
          <button (click)="selectedLevel = 'ALL'"
                  class="px-2.5 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer shrink-0"
                  [ngClass]="selectedLevel === 'ALL'
                    ? 'bg-cyan-500 text-black font-extrabold shadow-xs'
                    : (isDark ? 'bg-neutral-800 text-neutral-400 hover:text-white' : 'bg-neutral-100 text-neutral-600 hover:text-black')">
            ALL
          </button>
          <button *ngFor="let lvl of levels"
                  (click)="selectedLevel = lvl"
                  class="px-2.5 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer shrink-0"
                  [ngClass]="selectedLevel === lvl
                    ? 'bg-cyan-500 text-black font-extrabold shadow-xs'
                    : (isDark ? 'bg-neutral-800 text-neutral-400 hover:text-white' : 'bg-neutral-100 text-neutral-600 hover:text-black')">
            {{ lvl }}
          </button>
        </div>

        <!-- Category Filters -->
        <div class="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <span class="text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-500 mr-1.5 shrink-0">Type:</span>
          
          <!-- All Categories -->
          <button (click)="selectedCategory = 'ALL'"
                  class="px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                  [ngClass]="selectedCategory === 'ALL'
                    ? (isDark ? 'bg-white text-black font-bold' : 'bg-neutral-900 text-white font-bold')
                    : (isDark ? 'bg-neutral-800/80 text-neutral-400 hover:text-white' : 'bg-neutral-100 text-neutral-600 hover:text-black')">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            <span>All</span>
          </button>

          <!-- Grammar Filter -->
          <button (click)="selectedCategory = 'grammar'"
                  class="px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                  [ngClass]="selectedCategory === 'grammar'
                    ? (isDark ? 'bg-white text-black font-bold' : 'bg-neutral-900 text-white font-bold')
                    : (isDark ? 'bg-neutral-800/80 text-neutral-400 hover:text-white' : 'bg-neutral-100 text-neutral-600 hover:text-black')">
            <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" /></svg>
            <span>Grammar</span>
          </button>

          <!-- Vocabulary Filter -->
          <button (click)="selectedCategory = 'vocabulary'"
                  class="px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                  [ngClass]="selectedCategory === 'vocabulary'
                    ? (isDark ? 'bg-white text-black font-bold' : 'bg-neutral-900 text-white font-bold')
                    : (isDark ? 'bg-neutral-800/80 text-neutral-400 hover:text-white' : 'bg-neutral-100 text-neutral-600 hover:text-black')">
            <svg class="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /></svg>
            <span>Vocabulary</span>
          </button>

          <!-- Reading Filter -->
          <button (click)="selectedCategory = 'reading'"
                  class="px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                  [ngClass]="selectedCategory === 'reading'
                    ? (isDark ? 'bg-white text-black font-bold' : 'bg-neutral-900 text-white font-bold')
                    : (isDark ? 'bg-neutral-800/80 text-neutral-400 hover:text-white' : 'bg-neutral-100 text-neutral-600 hover:text-black')">
            <svg class="w-3.5 h-3.5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
            <span>Reading</span>
          </button>

          <!-- Songs Filter -->
          <button (click)="selectedCategory = 'songs'"
                  class="px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                  [ngClass]="selectedCategory === 'songs'
                    ? (isDark ? 'bg-white text-black font-bold' : 'bg-neutral-900 text-white font-bold')
                    : (isDark ? 'bg-neutral-800/80 text-neutral-400 hover:text-white' : 'bg-neutral-100 text-neutral-600 hover:text-black')">
            <svg class="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a.75.75 0 00.552-.721V7.155a.75.75 0 00-.552-.721L8.682 9.07a2.25 2.25 0 00-1.632 2.163v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a.75.75 0 00.552-.721V11.25" /></svg>
            <span>Songs</span>
          </button>

          <!-- Full Syllabus Filter -->
          <button (click)="selectedCategory = 'syllabus'"
                  class="px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                  [ngClass]="selectedCategory === 'syllabus'
                    ? (isDark ? 'bg-white text-black font-bold' : 'bg-neutral-900 text-white font-bold')
                    : (isDark ? 'bg-neutral-800/80 text-neutral-400 hover:text-white' : 'bg-neutral-100 text-neutral-600 hover:text-black')">
            <svg class="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>
            <span>Full Syllabus</span>
          </button>
        </div>

      </div>

      <!-- ══════════════════════════════════════════════════════════════
           4. 2-COLUMN STUDIO WORKSPACE (CATALOG & EDITOR)
      ══════════════════════════════════════════════════════════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">

        <!-- ─────────── LEFT COLUMN: LESSONS CATALOG (Compact Sidebar) ─────────── -->
        <div class="lg:col-span-4 xl:col-span-3 flex flex-col rounded-2xl sm:rounded-[24px] border overflow-hidden transition-all duration-200 shadow-lg min-h-[460px]"
             [ngClass]="isDark ? 'bg-[#030508] border-neutral-800' : 'bg-neutral-50/80 border-neutral-200/90'">

          <!-- Catalog Top Header -->
          <div class="px-4 py-3.5 border-b flex items-center justify-between shrink-0"
               [ngClass]="isDark ? 'border-neutral-800 bg-neutral-950/50' : 'border-neutral-200 bg-white/80'">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
              <h3 class="text-xs font-headline font-bold uppercase tracking-wider"
                  [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                Lesson Catalog
              </h3>
            </div>
            
            <div class="flex items-center gap-2">
              <span *ngIf="isLoading" class="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></span>
              <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
                    [ngClass]="isDark ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-200 text-neutral-700'">
                {{ filteredMaterials.length }}
              </span>
            </div>
          </div>

          <!-- Cards List -->
          <div class="p-3 flex-1 overflow-y-auto flex flex-col gap-2.5 max-h-[580px] no-scrollbar">
            
            <!-- Loading -->
            <div *ngIf="isLoading && materials.length === 0" class="py-16 text-center text-neutral-500 text-xs flex flex-col items-center gap-2.5">
              <div class="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading lessons...</span>
            </div>

            <!-- Empty State -->
            <div *ngIf="!isLoading && filteredMaterials.length === 0" class="text-center py-12 px-4 text-neutral-500 text-xs flex flex-col items-center justify-center">
              <p class="font-medium text-neutral-400">No study plans found.</p>
              <button (click)="createNewMaterial()" class="mt-3 px-3.5 py-1.5 rounded-full text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black transition-all cursor-pointer">
                + Create Lesson
              </button>
            </div>

            <!-- Material Card -->
            <div *ngFor="let mat of filteredMaterials"
                 (click)="selectMaterial(mat)"
                 class="p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col gap-2"
                 [ngClass]="[
                   currentMaterial?.id === mat.id 
                     ? (isDark ? 'bg-cyan-500/10 border-cyan-500/60 shadow-xs' : 'bg-cyan-50/90 border-cyan-400 shadow-xs') 
                     : (isDark ? 'bg-neutral-900/70 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900' : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50')
                 ]">
              
              <!-- Card Top Row -->
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold"
                        [ngClass]="getLevelBadgeClass(mat.level)">
                    {{ mat.level }}
                  </span>
                  <span class="text-xs sm:text-sm font-headline font-bold truncate"
                        [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                    {{ mat.title }}
                  </span>
                </div>

                <!-- Active Grounding Badge -->
                <span *ngIf="mat.isActive" 
                      class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  ACTIVE
                </span>
              </div>

              <!-- Content Preview -->
              <p class="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                {{ getSnippet(mat.content) }}
              </p>

              <!-- Footer -->
              <div class="flex items-center justify-between pt-1.5 text-[11px] text-neutral-500 border-t"
                   [ngClass]="isDark ? 'border-neutral-800/60' : 'border-neutral-100'">
                <span class="capitalize font-medium">
                  {{ getCategoryLabel(mat.category) }}
                </span>

                <div class="flex items-center gap-2.5">
                  <button *ngIf="!mat.isActive"
                          (click)="activateMaterial(mat, $event)"
                          class="hover:text-cyan-400 font-bold transition-colors cursor-pointer text-xs">
                    Activate
                  </button>
                  <button (click)="deleteMaterial(mat, $event)"
                          class="hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete lesson">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

        <!-- ─────────── RIGHT COLUMN: LESSON EDITOR (Spacious Canvas) ─────────── -->
        <div class="lg:col-span-8 xl:col-span-9 flex flex-col rounded-2xl sm:rounded-[24px] border overflow-hidden transition-all duration-200 shadow-lg min-h-[460px]"
             [ngClass]="isDark ? 'bg-[#090b10]/95 border-neutral-800' : 'bg-white border-neutral-200/90'">

          <!-- Editor Header -->
          <div class="px-4 py-3.5 border-b flex items-center justify-between shrink-0"
               [ngClass]="isDark ? 'border-neutral-800/80 bg-neutral-950/50' : 'border-neutral-200/80 bg-neutral-50/70'">
            
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-8 h-8 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </div>
              <h3 class="text-sm font-headline font-bold truncate"
                  [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                {{ editorTitle || 'New Lesson' }}
              </h3>
            </div>

            <!-- Templates -->
            <div class="flex items-center gap-1.5 shrink-0">
              <span class="text-[11px] text-neutral-500 hidden sm:inline font-medium">Templates:</span>
              <button (click)="loadPreset('a1')"
                      class="px-2 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer hover:border-cyan-500"
                      [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-300' : 'bg-white border-neutral-200 text-neutral-700'">
                A1
              </button>
              <button (click)="loadPreset('b1')"
                      class="px-2 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer hover:border-cyan-500"
                      [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-300' : 'bg-white border-neutral-200 text-neutral-700'">
                B1
              </button>
              <button (click)="loadPreset('b2')"
                      class="px-2 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer hover:border-cyan-500"
                      [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-300' : 'bg-white border-neutral-200 text-neutral-700'">
                B2
              </button>
            </div>

          </div>

          <!-- Form Row -->
          <div class="p-3.5 border-b grid grid-cols-1 sm:grid-cols-12 gap-2.5 shrink-0"
               [ngClass]="isDark ? 'border-neutral-800/80 bg-neutral-950/20' : 'border-neutral-200/80 bg-neutral-50/50'">
            
            <!-- Title -->
            <div class="sm:col-span-6 flex flex-col gap-1">
              <label class="text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-400">Lesson Title</label>
              <input [(ngModel)]="editorTitle"
                     type="text"
                     placeholder="e.g. Present Continuous vs Simple..."
                     class="w-full px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                     [ngClass]="isDark ? 'bg-neutral-900/90 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'">
            </div>

            <!-- Level -->
            <div class="sm:col-span-3 flex flex-col gap-1">
              <label class="text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-400">CEFR Level</label>
              <select [(ngModel)]="editorLevel"
                      class="w-full px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-bold border transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
                      [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'">
                <option *ngFor="let lvl of levels" [value]="lvl">{{ lvl }} Level</option>
              </select>
            </div>

            <!-- Category -->
            <div class="sm:col-span-3 flex flex-col gap-1">
              <label class="text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-400">Category</label>
              <select [(ngModel)]="editorCategory"
                      class="w-full px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
                      [ngClass]="isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-900'">
                <option value="grammar">Grammar</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="reading">Reading & Dialogue</option>
                <option value="songs">Songs & Lyrics</option>
                <option value="syllabus">Full Daily Syllabus</option>
              </select>
            </div>

          </div>

          <!-- Content Canvas -->
          <div class="p-3.5 flex-1 flex flex-col min-h-[260px] overflow-hidden relative">
            <textarea [(ngModel)]="editorContent"
                      placeholder="Type or paste your complete study plan, grammar notes, vocabulary lists, dialogues or song lyrics..."
                      class="w-full h-full p-3.5 rounded-xl border font-mono text-xs sm:text-sm leading-relaxed transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none overflow-y-auto"
                      [ngClass]="isDark ? 'bg-[#030508] border-neutral-800 text-neutral-200 placeholder-neutral-600' : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400'"></textarea>

            <div class="flex items-center justify-between text-[11px] text-neutral-500 pt-2 shrink-0">
              <span class="font-mono">{{ editorContent.length }} chars • {{ getWordCount(editorContent) }} words</span>
              <span>Markdown and dialogues supported</span>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="px-4 py-3 border-t flex items-center justify-between shrink-0"
               [ngClass]="isDark ? 'border-neutral-800/80 bg-neutral-950/50' : 'border-neutral-200/80 bg-neutral-50/70'">
            
            <button (click)="clearEditor()"
                    class="px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear</span>
            </button>

            <div class="flex items-center gap-2">
              
              <!-- Save Only -->
              <button (click)="saveMaterial(false)"
                      [disabled]="isSaving"
                      class="px-4 py-2 rounded-full text-xs font-headline font-bold uppercase tracking-wider border transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                      [ngClass]="isDark ? 'border-neutral-700 hover:bg-neutral-800 text-neutral-200' : 'border-neutral-300 hover:bg-neutral-100 text-neutral-800'">
                {{ isSaving ? 'Saving...' : 'Save Lesson' }}
              </button>

              <!-- Save & Activate for Rotbot -->
              <button (click)="saveMaterial(true)"
                      [disabled]="isSaving"
                      class="px-5 py-2 rounded-full text-xs font-headline font-bold uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/25 transition-all cursor-pointer flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>{{ isSaving ? 'Saving...' : 'Activate for Rotbot' }}</span>
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  `,
  styles: [`
    .tab-enter { animation: tabEnter 0.25s ease-out forwards; }
    @keyframes tabEnter {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.98); }
      to   { opacity: 1; transform: scale(1); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out forwards;
    }
  `]
})
export class DashStudyPlanComponent implements OnInit {
  @Input() theme = 'dark';
  @Output() switchMode = new EventEmitter<RotbotMode>();

  private robotService = inject(RobotChatService);

  levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

  materials: StudyMaterial[] = [];
  selectedLevel: string = 'ALL';
  selectedCategory: string = 'ALL';
  searchQuery: string = '';

  currentMaterial: StudyMaterial | null = null;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  isLoading = false;
  isSaving = false;

  // Editor State
  editorId: string = '';
  editorTitle: string = '';
  editorLevel: CEFRLevel = 'A1';
  editorCategory: MaterialCategory = 'grammar';
  editorContent: string = '';
  editorIsActive: boolean = false;

  get isDark() { return this.theme === 'dark'; }

  get activeMaterial(): StudyMaterial | null {
    return this.materials.find(m => m.isActive) || null;
  }

  get grammarCount(): number {
    return this.materials.filter(m => m.category === 'grammar').length;
  }

  get vocabCount(): number {
    return this.materials.filter(m => m.category === 'vocabulary').length;
  }

  get immersionCount(): number {
    return this.materials.filter(m => m.category === 'reading' || m.category === 'songs').length;
  }

  get filteredMaterials(): StudyMaterial[] {
    return this.materials.filter(m => {
      const matchLevel = this.selectedLevel === 'ALL' || m.level === this.selectedLevel;
      const matchCategory = this.selectedCategory === 'ALL' || m.category === this.selectedCategory;
      const matchQuery = !this.searchQuery.trim() || 
        m.title.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        m.content.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchLevel && matchCategory && matchQuery;
    });
  }

  ngOnInit() {
    this.fetchMaterials();
  }

  fetchMaterials() {
    this.isLoading = true;
    this.robotService.getMaterials().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const items = res?.data || (Array.isArray(res) ? res : []);
        this.materials = items;

        const active = this.materials.find(m => m.isActive);
        this.robotService.setCachedActive(active || null);

        if (active) {
          this.selectMaterial(active);
        } else if (this.materials.length > 0) {
          this.selectMaterial(this.materials[0]);
        } else {
          this.createNewMaterial();
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.warn('[DashStudyPlan] Error loading from backend:', err);
        this.materials = [];
        this.createNewMaterial();
      }
    });
  }

  selectMaterial(mat: StudyMaterial) {
    this.currentMaterial = mat;
    this.editorId = mat.id;
    this.editorTitle = mat.title;
    this.editorLevel = mat.level;
    this.editorCategory = mat.category;
    this.editorContent = mat.content;
    this.editorIsActive = mat.isActive;
  }

  createNewMaterial() {
    this.currentMaterial = null;
    this.editorId = 'new_' + Date.now();
    this.editorTitle = '';
    this.editorLevel = 'A1';
    this.editorCategory = 'grammar';
    this.editorContent = '';
    this.editorIsActive = false;
  }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => {
      if (this.toastMessage === message) {
        this.toastMessage = '';
      }
    }, 3500);
  }

  saveMaterial(activate: boolean = false) {
    if (!this.editorTitle.trim()) {
      this.editorTitle = 'Untitled Lesson';
    }

    this.isSaving = true;
    const payload: Partial<StudyMaterial> = {
      id: this.editorId.startsWith('new_') ? undefined : this.editorId,
      title: this.editorTitle.trim(),
      level: this.editorLevel,
      category: this.editorCategory,
      content: this.editorContent.trim(),
      isActive: activate || this.editorIsActive
    };

    this.robotService.saveMaterial(payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        const saved = res.data || (res as any);
        this.showToast(activate ? `Lesson "${saved.title}" activated for Rotbot!` : `Lesson "${saved.title}" saved.`);
        
        this.fetchMaterials();

        if (activate) {
          this.robotService.setCachedActive(saved);
          setTimeout(() => {
            this.switchMode.emit('charla');
          }, 400);
        }
      },
      error: (err) => {
        this.isSaving = false;
        this.showToast('Error saving to database', 'error');
        console.error(err);
      }
    });
  }

  activateMaterial(mat: StudyMaterial, event: Event) {
    event.stopPropagation();
    this.robotService.activateMaterial(mat.id).subscribe({
      next: () => {
        this.showToast(`Lesson "${mat.title}" activated for Rotbot!`);
        this.fetchMaterials();
      },
      error: () => {
        this.showToast('Could not activate lesson', 'error');
      }
    });
  }

  deleteMaterial(mat: StudyMaterial, event: Event) {
    event.stopPropagation();
    this.robotService.deleteMaterial(mat.id).subscribe({
      next: () => {
        this.showToast(`Lesson deleted.`);
        this.fetchMaterials();
      },
      error: () => {
        this.showToast('Error deleting lesson', 'error');
      }
    });
  }

  clearEditor() {
    this.editorContent = '';
  }

  getSnippet(text: string): string {
    const clean = text.replace(/#+\s*/g, '').replace(/[\n\r]+/g, ' ');
    return clean.length > 100 ? clean.substring(0, 97) + '...' : clean;
  }

  getWordCount(text: string): number {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  }

  getLevelBadgeClass(level: CEFRLevel): string {
    switch (level) {
      case 'A1': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'A2': return 'bg-teal-500/20 text-teal-400 border border-teal-500/30';
      case 'B1': return 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30';
      case 'B2': return 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30';
      case 'C1': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      default: return 'bg-neutral-800 text-neutral-300';
    }
  }

  getCategoryLabel(cat: MaterialCategory): string {
    switch (cat) {
      case 'grammar': return 'Grammar';
      case 'vocabulary': return 'Vocabulary';
      case 'reading': return 'Reading & Dialogue';
      case 'songs': return 'Songs & Lyrics';
      case 'syllabus': return 'Full Daily Syllabus';
      default: return cat;
    }
  }

  loadPreset(level: 'a1' | 'b1' | 'b2') {
    if (level === 'a1') {
      this.editorTitle = 'Present Simple & Daily Habits';
      this.editorLevel = 'A1';
      this.editorCategory = 'grammar';
      this.editorContent = `### A1 GRAMMAR: PRESENT SIMPLE & ROUTINES
- TARGET RULES:
  * Affirmative: I/You/We/They + verb (e.g., I wake up at 7:00 AM).
  * 3rd Person: He/She/It + verb-s/es (e.g., She works from home, he watches movies).
  * Negatives: don't / doesn't + base verb.
- KEY EXAMPLES:
  * "I always take a 10-minute break after lunch."
  * "She studies English every evening."
- PRACTICE CHALLENGE:
  Ask the user about their morning routine and test 3rd person singular '-s' conjugation.`;
    } else if (level === 'b1') {
      this.editorTitle = 'Coldplay - Yellow (Lyrics & Idioms)';
      this.editorLevel = 'B1';
      this.editorCategory = 'songs';
      this.editorContent = `### B1 SONGS & LYRICS: "YELLOW" BY COLDPLAY
- LYRICS EXCERPT:
  "Look at the stars, look how they shine for you, and everything you do...
   I drew a line, I drew a line for you, oh what a thing to do, and it was all yellow."
- VOCABULARY & IDIOMS:
  * "Look how they shine": Expressing awe and admiration.
  * "To draw a line": Setting a boundary or making a dedicated commitment.
  * "It was all yellow": Metaphor for warmth, hope, and brightness.
- PRACTICE TASK:
  Ask the user what emotions or ideas they associate with the phrase 'to draw a line'.`;
    } else if (level === 'b2') {
      this.editorTitle = 'Corporate Standup & Status Updates';
      this.editorLevel = 'B2';
      this.editorCategory = 'syllabus';
      this.editorContent = `### B2 BUSINESS ENGLISH: STATUS UPDATES & MILESTONES
- GOAL: Run a standup meeting and report deliverables concisely.
- GRAMMAR FOCUS: Present Perfect vs Past Simple for milestone tracking.
- BUSINESS IDIOMS:
  * "Touch base": Make brief contact with someone.
  * "Bottleneck": A point of congestion in a system that delays progress.
  * "Action item": A documented task to be completed.
- TARGET DIALOGUE:
  * "Let's touch base on the client deliverables before tomorrow morning."`;
    }
  }
}
