"use client";

import React from "react";
import Link from "next/link";

interface AdminTopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function AdminTopBar({ searchQuery, onSearchChange }: AdminTopBarProps) {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-md py-sm bg-surface border-b-[0.5px] border-outline-variant transition-transform duration-300 ease-in-out">
      <div className="flex items-center gap-md">
        <Link href="/" className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim hover:opacity-80 transition-opacity">
          V-Market India
        </Link>
        <span className="font-label-xs text-label-xs bg-primary-container text-on-primary-container px-2 py-1 rounded-full uppercase tracking-widest">
          Admin
        </span>
      </div>

      {/* Center Search (Hidden on Mobile) */}
      <div className="hidden md:flex flex-1 max-w-md mx-md">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5 select-none">
            search
          </span>
          <input
            className="w-full bg-surface-container-low border-[0.5px] border-outline-variant rounded-full py-2 pl-xl pr-sm text-body-sm focus:outline-none focus:border-primary transition-colors focus:bg-surface text-on-surface"
            placeholder="Search sellers, products, orders..."
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-sm">
        <button className="p-xs text-on-surface hover:opacity-80 transition-opacity rounded-full hover:bg-surface-container relative active:scale-95 duration-200">
          <span className="material-symbols-outlined w-6 h-6 flex items-center justify-center">
            notifications
          </span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <button className="p-xs text-on-surface hover:opacity-80 transition-opacity rounded-full hover:bg-surface-container active:scale-95 duration-200">
          <img
            alt="Admin Avatar"
            className="w-8 h-8 rounded-full object-cover border-[0.5px] border-outline-variant"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHy1Ni_ETRoImeuUnYQEeRZOK1yucDDBeAJI_zM7h7QNghxJ_42D3OcjV2pKGidB2VKnziu7LouzXaaMttQKVN6q0ujAeHqehcXvefM-slHgAToQwlDIpQc6xqtcgyxqqD2aRUCrSXFe9nMoJ_EIMhfVplgtbzEpA6u3CAFtsF7bUhXH-EmRInoM4bPH6IWLQSiGXQutA9BEHi3WsQnW5vEb9UBqQ8PM4yl5XWiGR1SypKmSi14rLl-jUN2OI11JDIQ5asWH4fU9EV"
          />
        </button>
      </div>
    </nav>
  );
}
