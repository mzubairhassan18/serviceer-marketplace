"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, MapPin, Search } from "lucide-react";

const popular = ["AC repair", "Home cleaning", "Electrician", "Painter"];

export function HeroSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [location, setLocation] = useState("");

  function search(nextQuery = query) {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    router.push(`/${params.size ? `?${params}` : ""}#services`, { scroll: false });
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    });
  }

  return (
    <div className="hero-search-wrap">
      <div className="hero-search" role="search">
        <div className="hero-search-field hero-search-service">
          <Search size={20} aria-hidden="true" />
          <label>
            <span>What do you need?</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && search()}
              placeholder="Plumber, cleaner, photographer..."
              aria-label="Search services"
            />
          </label>
        </div>
        <div className="hero-search-divider" />
        <div className="hero-search-field hero-search-location">
          <MapPin size={20} aria-hidden="true" />
          <label>
            <span>Where?</span>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Your city or area"
              aria-label="Location"
            />
          </label>
        </div>
        <button type="button" className="hero-search-button" onClick={() => search()}>
          <Search size={19} />
          <span>Find help</span>
        </button>
      </div>
      <div className="popular-searches" aria-label="Popular searches">
        <span>Popular now</span>
        {popular.map((item) => (
          <button key={item} type="button" onClick={() => { setQuery(item); search(item); }}>
            {item}<ArrowRight size={13} />
          </button>
        ))}
      </div>
    </div>
  );
}
