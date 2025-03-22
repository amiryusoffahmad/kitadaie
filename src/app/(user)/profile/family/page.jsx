import FamilyList from './_components/FamilyList'

export const metadata = {
    title: 'Family',
    description: 'View and manage your family members',
}

export default function FamilyPage() {
    return (
        <div>
            <FamilyList />
        </div>
    )
} 