import ProfileReportContainer from './_components/ProfileReportContainer'

export const metadata = {
  title: 'Profile Completion Report | Kita Daie',
  description: 'Admin report for user profile completion status'
}

export default function ProfileReportPage() {
  return (
    <div className='container mx-auto p-6'>
      <ProfileReportContainer />
    </div>
  )
}
