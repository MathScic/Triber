import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { AppNav } from '@/components/shared/AppNav'
import { MOBILE_NAV_HEIGHT_PX } from '@/lib/utils/layout'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppNav />
      {/* Offset : sidebar fixe 208px sur desktop, espace nav basse sur mobile.
          Le padding vient de MOBILE_NAV_HEIGHT_PX (SidebarMobile.tsx) via une
          custom property — évite que les deux divergent silencieusement si la
          nav mobile change de hauteur. */}
      <div
        className="xl:ml-56 pb-[var(--mobile-nav-h)] xl:pb-0"
        style={{ '--mobile-nav-h': `${MOBILE_NAV_HEIGHT_PX}px` } as React.CSSProperties}
      >
        {children}
      </div>
    </ThemeProvider>
  )
}
