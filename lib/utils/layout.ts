// Hauteur réelle mesurée de la nav mobile fixe (SidebarMobile.tsx) : ligne
// nom+déconnexion ~21px + ligne icônes ~64px, + marge de sécurité. Vit dans
// un fichier neutre (pas 'use client') car SidebarMobile est un Client
// Component — un Server Component qui l'importerait n'obtiendrait pas la
// vraie valeur mais une référence client invoquable côté serveur.
// app/(dashboard)/layout.tsx (Server Component) et SidebarMobile.tsx
// importent tous les deux cette constante pour ne jamais diverger.
export const MOBILE_NAV_HEIGHT_PX = 96
