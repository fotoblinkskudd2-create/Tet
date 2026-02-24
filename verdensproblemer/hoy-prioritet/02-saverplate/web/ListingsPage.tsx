// SaverPlate Web — Kartbasert listingsside med bestilling (Next.js 14 + Mapbox)
"use client";

import { useState, useEffect, useCallback } from "react";

interface StoreListing {
  id: string;
  store: { id: string; name: string; lat: number; lng: number };
  title: string;
  description: string;
  original_price: number;
  price: number;
  quantity_available: number;
  pickup_start: string;
  pickup_end: string;
  image_url?: string;
  distance_km: number;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";

async function fetchListings(lat: number, lng: number, radius = 5): Promise<StoreListing[]> {
  const token = localStorage.getItem("sp_token");
  const res = await fetch(`${API}/listings?lat=${lat}&lng=${lng}&r=${radius}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json();
  return data.listings;
}

async function placeOrder(listingId: string, quantity: number) {
  const token = localStorage.getItem("sp_token");
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ listing_id: listingId, quantity }),
  });
  if (!res.ok) throw new Error("Order failed");
  return res.json();
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" });
}

function ListingCard({
  listing,
  onSelect,
}: {
  listing: StoreListing;
  onSelect: (l: StoreListing) => void;
}) {
  const discount = Math.round((1 - listing.price / listing.original_price) * 100);

  return (
    <button
      onClick={() => onSelect(listing)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition text-left w-full"
      aria-label={`${listing.title} fra ${listing.store.name}, ${listing.price} kr`}
    >
      <div className="h-32 bg-green-50 flex items-center justify-center relative">
        <span className="text-4xl">🥖</span>
        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          -{discount}%
        </span>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-500">{listing.store.name} · {listing.distance_km.toFixed(1)} km</p>
        <p className="font-semibold text-gray-900 mt-1">{listing.title}</p>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-lg font-bold text-green-600">{listing.price} kr</span>
          <span className="text-sm text-gray-400 line-through">{listing.original_price} kr</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Hent {formatTime(listing.pickup_start)}–{formatTime(listing.pickup_end)}
        </p>
      </div>
    </button>
  );
}

function OrderModal({
  listing,
  onClose,
}: {
  listing: StoreListing;
  onClose: () => void;
}) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ordered, setOrdered] = useState(false);

  const handleOrder = async () => {
    setLoading(true);
    try {
      await placeOrder(listing.id, qty);
      setOrdered(true);
    } catch {
      alert("Bestilling feilet. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  };

  if (ordered) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
          <span className="text-6xl">🎉</span>
          <h2 className="text-2xl font-bold mt-4">Bestilling bekreftet!</h2>
          <p className="text-gray-500 mt-2">
            Hent hos {listing.store.name} mellom {formatTime(listing.pickup_start)}–{formatTime(listing.pickup_end)}
          </p>
          <p className="text-sm text-green-600 mt-4 font-medium">
            Du reddet {((listing.original_price - listing.price) * qty * 0.5).toFixed(0)}g CO₂ 🌍
          </p>
          <button
            onClick={onClose}
            className="mt-6 bg-green-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-600 transition"
          >
            Flott!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">{listing.store.name}</p>
            <h2 className="text-xl font-bold">{listing.title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl" aria-label="Lukk">✕</button>
        </div>
        <p className="text-gray-600 text-sm mt-2">{listing.description}</p>
        <div className="flex items-center justify-between mt-4 bg-gray-50 rounded-xl p-4">
          <div>
            <span className="text-2xl font-bold text-green-600">{listing.price * qty} kr</span>
            <span className="text-sm text-gray-400 line-through ml-2">{listing.original_price * qty} kr</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
              aria-label="Reduser antall"
            >−</button>
            <span className="font-bold text-lg">{qty}</span>
            <button
              onClick={() => setQty(Math.min(listing.quantity_available, qty + 1))}
              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
              aria-label="Øk antall"
            >+</button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Hent {formatTime(listing.pickup_start)}–{formatTime(listing.pickup_end)} · {listing.quantity_available} igjen
        </p>
        <button
          onClick={handleOrder}
          disabled={loading}
          className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
        >
          {loading ? "Bestiller…" : `Bestill — ${listing.price * qty} kr`}
        </button>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  const [listings, setListings] = useState<StoreListing[]>([]);
  const [selected, setSelected] = useState<StoreListing | null>(null);
  const [loading, setLoading] = useState(true);

  const loadListings = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    const data = await fetchListings(lat, lng);
    setListings(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => loadListings(pos.coords.latitude, pos.coords.longitude),
      () => loadListings(59.91, 10.75) // fallback: Oslo
    );
  }, [loadListings]);

  return (
    <main className="min-h-screen bg-[#F5F5F0]">
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <h1 className="text-xl font-bold text-gray-900">SaverPlate</h1>
          </div>
          <p className="text-sm text-gray-500">{listings.length} tilbud nær deg</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl">🔍</span>
            <p className="text-gray-500 mt-4">Ingen tilbud i nærheten akkurat nå. Sjekk igjen snart!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} onSelect={setSelected} />
            ))}
          </div>
        )}
      </div>

      {selected && <OrderModal listing={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
