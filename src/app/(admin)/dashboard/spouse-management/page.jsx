import SpouseManagementContainer from './_components/SpouseManagementContainer'

export const metadata = {
  title: 'Spouse Management | Kita Daie',
  description: 'Manage spouse linking for married users'
}

export default function SpouseManagementPage() {
  return (
    <div className='container mx-auto p-6'>
      <SpouseManagementContainer />
    </div>
  )
}
