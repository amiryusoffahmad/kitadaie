import CertificationList from './_components/CertificationList'

export const metadata = {
    title: 'Certifications',
    description: 'View and manage your certifications',
}

export default function CertificationsPage() {
    return (
        <div>
            <CertificationList />
        </div>
    )
} 