import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { AppNav } from '@/components/shared/AppNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppNav />
      {/* Offset : sidebar fixe 208px sur desktop, espace nav basse sur mobile
          (nav mobile ~85px avec la ligne nom+déconnexion — pb-24 pour ne pas
          cacher le bas du contenu derrière la barre fixe) */}
      <div className="lg:ml-56 pb-24 lg:pb-0">
        {children}
      </div>
    </ThemeProvider>
  )
}
