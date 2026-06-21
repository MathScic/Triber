import { redirect } from 'next/navigation'

// Redirige vers /home — le middleware gère la protection de route si non connecté
export default function RootPage() {
  redirect('/home')
}
