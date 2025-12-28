import { PageContainer } from "@/components/admin";
import ProfileReportContainer from './_components/ProfileReportContainer';

export const metadata = {
  title: 'Profile Completion Report | Admin',
  description: 'Admin report for user profile completion status'
}

export default function ProfileReportPage() {
  return (
    <PageContainer>
      <ProfileReportContainer />
    </PageContainer>
  );
}
