'use client';

import { useState, useEffect } from 'react';

interface NavItem {
  label: string;
  url: string;
  location: string;
}

interface SiteSetting {
  logo: string;
  email: string;
  phone: string;
  facebookUrl: string;
  instagramUrl: string;
  address: string;
  mapEmbedUrl: string;
  footerText: string;
  copyrightText: string;
}

export interface PublicData {
  siteSettings: SiteSetting | null;
  navByLocation: Record<string, NavItem[]>;
}

const DEFAULT_DATA: PublicData = {
  siteSettings: {
    logo: '/images/logo/logo.png',
    email: 'info@danphehealth.com',
    phone: '+977-9852088004',
    facebookUrl: '',
    instagramUrl: '',
    address: 'Kathmandu, Nepal',
    mapEmbedUrl: '',
    footerText: 'danphehealth.com',
    copyrightText: '© Copyright 2024 Danphe Health. All Rights Reserved.',
  },
  navByLocation: {},
};

/**
 * Shared hook to fetch public site data (settings + nav items).
 * Falls back to DEFAULT_DATA so components always have something to render.
 */
export function usePublicData() {
  const [data, setData] = useState<PublicData>(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/public-data')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (!cancelled) {
          setData({
            siteSettings: json.siteSettings ?? DEFAULT_DATA.siteSettings,
            navByLocation: json.navByLocation ?? {},
          });
          setLoaded(true);
        }
      })
      .catch((err) => {
        console.warn('[usePublicData] fetch failed, using defaults:', err);
        if (!cancelled) setLoaded(true);
      });
    return () => { cancelled = true; };
  }, []);

  return { data, loaded };
}
