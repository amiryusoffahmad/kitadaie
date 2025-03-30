'use client';

import { usePathname } from 'next/navigation';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function AdminBreadcrumb() {
    // Get the current pathname
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    // Generate breadcrumb items based on path segments
    const getBreadcrumbItems = () => {
        const items = [];
        let path = '';

        // Start with dashboard if we're in admin section
        if (segments.length > 0 && segments[0] === 'admin-tprog') {
            items.push({
                label: 'Dashboard',
                href: '/admin-tprog',
                isCurrent: segments.length === 1
            });

            // Add subsequent path segments
            for (let i = 1; i < segments.length; i++) {
                const segment = segments[i];
                path += `/${segment}`;

                // Format the segment for display (capitalize, replace hyphens)
                let label = segment
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase());

                // Use specific names for known routes
                if (segment === 'class') {
                    label = 'Class Management';
                }

                // Skip dynamic segments with [id] format
                if (segment.startsWith('[') && segment.endsWith(']')) {
                    continue;
                }

                // Check if this is the last segment (current page)
                const isCurrent = i === segments.length - 1;

                items.push({
                    label,
                    href: isCurrent ? undefined : `/admin-tprog${path}`,
                    isCurrent
                });
            }
        }

        return items;
    };

    const breadcrumbItems = getBreadcrumbItems();

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                    <div key={index} className="flex items-center">
                        {index > 0 && (
                            <BreadcrumbSeparator className="hidden md:flex" />
                        )}
                        <BreadcrumbItem className="hidden md:flex">
                            {item.isCurrent ? (
                                <BreadcrumbPage>{item.label}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink href={item.href}>
                                    {item.label}
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                    </div>
                ))}
                {breadcrumbItems.length === 0 && (
                    <BreadcrumbItem>
                        <BreadcrumbPage>Admin Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                )}
            </BreadcrumbList>
        </Breadcrumb>
    );
} 