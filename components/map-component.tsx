"use client"

import { useEffect, useRef } from "react"
import type { UserProfile } from "@/lib/storage"

interface MapComponentProps {
  users: UserProfile[]
  selectedUserId: string | null
  onPinClick: (userId: string) => void
}

export default function MapComponent({ users, selectedUserId, onPinClick }: MapComponentProps) {
  const mapRef = useRef<any | null>(null)
  const markersRef = useRef<Map<string, any>>(new Map())

  const getRankTier = (userId: string): "gold" | "silver" | "bronze" => {
    // We need to import getLeaderboard, but let's simplify for now
    // const leaderboard = getLeaderboard("all-time")
    // const userRank = leaderboard.find((u) => u.userId === userId)?.rank || 999
    const user = users.find(u => u.id === userId);
    if (!user) return "bronze";
    
    // Simplified ranking based on upvotes
    if (user.upvotes >= 1000) return "gold";
    if (user.upvotes >= 100) return "silver";
    return "bronze";
  }

  const getPinColor = (tier: "gold" | "silver" | "bronze"): string => {
    switch (tier) {
      case "gold":
        return "#FFD700"
      case "silver":
        return "#C0C0C0"
      case "bronze":
        return "#CD7F32"
    }
  }

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === "undefined") {
      return
    }

    // Dynamically load Leaflet only on client side
    const loadLeaflet = async () => {
      if (!(window as any).L) {
        // Load Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
        
        // Load Leaflet JS
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
        
        // Load MarkerCluster CSS
        const clusterLink = document.createElement('link');
        clusterLink.rel = 'stylesheet';
        clusterLink.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css';
        document.head.appendChild(clusterLink);
        
        // Load MarkerCluster JS
        await new Promise((resolve) => {
          const clusterScript = document.createElement('script');
          clusterScript.src = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js';
          clusterScript.onload = resolve;
          document.head.appendChild(clusterScript);
        });
      }
      
      const L = (window as any).L;
      
      if (!L) return;

      if (!mapRef.current) {
        mapRef.current = L.map("map").setView([20, 0], 2)

        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        }).addTo(mapRef.current)
      }

      // Clear existing markers
      markersRef.current.forEach((marker: any) => {
        mapRef.current?.removeLayer(marker)
      })
      markersRef.current.clear()

      const MarkerClusterGroup = (L as any).markerClusterGroup
      const markerGroup = new MarkerClusterGroup()

      // Filter users with valid location data
      const usersWithLocation = users.filter(user => 
        user.location && 
        typeof user.location.lat === 'number' && 
        typeof user.location.lng === 'number' &&
        user.location.lat !== 0 && 
        user.location.lng !== 0
      )

      if (usersWithLocation.length === 0) {
        // Show privacy notice when no users have location data
        const privacyNotice = L.control({ position: "bottomleft" })
        privacyNotice.onAdd = function() {
          const div = L.DomUtil.create("div", "privacy-notice")
          div.innerHTML = `
            <div style="
              background: rgba(255, 255, 255, 0.9);
              padding: 10px;
              border-radius: 5px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              font-size: 12px;
              max-width: 300px;
            ">
              <strong>Privacy Notice:</strong> We only show city-level location data to protect user privacy. 
              Users must opt-in to share their location.
            </div>
          `
          return div
        }
        privacyNotice.addTo(mapRef.current)
        return
      }

      usersWithLocation.forEach((user) => {
        if (user.location) {
          const tier = getRankTier(user.id)
          const color = getPinColor(tier)

          const iconHtml = `
            <div style="
              background-color: ${color};
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              font-weight: bold;
              font-size: 12px;
              color: ${tier === "gold" ? "#333" : "white"};
            ">
              ${user.displayName.charAt(0)}
            </div>
          `

          const icon = L.divIcon({
            html: iconHtml,
            iconSize: [32, 32],
            className: "custom-marker",
          })

          const marker = L.marker([user.location.lat, user.location.lng], {
            icon,
            title: user.displayName,
          })

          const popupContent = `
            <div class="p-3 min-w-48">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-sm font-semibold">
                  ${user.displayName.charAt(0)}
                </div>
                <div>
                  <p class="font-semibold text-sm">${user.displayName}</p>
                  <p class="text-xs text-gray-600">@${user.username}</p>
                </div>
              </div>
              <p class="text-xs text-gray-600 mb-2">${user.location.city}, ${user.location.country}</p>
              <div class="grid grid-cols-2 gap-2 mb-3">
                <div class="bg-gray-100 p-2 rounded">
                  <p class="text-xs text-gray-600">Views</p>
                  <p class="font-semibold text-sm">${user.views}</p>
                </div>
                <div class="bg-gray-100 p-2 rounded">
                  <p class="text-xs text-gray-600">Upvotes</p>
                  <p class="font-semibold text-sm">${user.upvotes}</p>
                </div>
              </div>
              <button onclick="window.location.href='/profile/${user.id}'" class="w-full px-3 py-1 bg-gray-800 text-white rounded text-xs font-medium hover:bg-gray-700">
                View Profile
              </button>
            </div>
          `

          marker.bindPopup(popupContent)
          marker.on("click", () => onPinClick(user.id))

          markersRef.current.set(user.id, marker)
          markerGroup.addLayer(marker)
        }
      })

      mapRef.current?.addLayer(markerGroup)

      // Highlight selected marker
      if (selectedUserId && markersRef.current.has(selectedUserId)) {
        const marker = markersRef.current.get(selectedUserId)
        marker?.openPopup()
      }
    };

    loadLeaflet();
  }, [users, selectedUserId, onPinClick])

  return <div id="map" className="w-full h-full" style={{ minHeight: "600px" }} />
}