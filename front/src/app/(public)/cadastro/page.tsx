import { Suspense } from 'react'
import { CadastroForm } from './CadastroForm'
export const metadata = { title: 'Criar conta' }
export default function Page() { return <Suspense><CadastroForm /></Suspense> }
