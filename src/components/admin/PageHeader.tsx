import Link from 'next/link';

interface PageHeaderProps {
    title: string;
    actionLabel?: string;
    actionHref?: string;
}

export default function PageHeader({ title, actionLabel, actionHref }: PageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between mb-8 gap-4">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 text-center md:text-left">{title}</h1>
            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}
