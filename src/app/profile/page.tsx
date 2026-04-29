import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
    const sessionUser = await getCurrentUser();

    if (!sessionUser) {
        redirect("/login");
    }

    const customer = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        include: {
            orders: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!customer) {
        redirect("/login");
    }

    // Serialize Decimal to number for Client Component
    const serializedOrders = customer.orders.map(order => ({
        ...order,
        total: order.total.toNumber()
    }));

    // Exclude orders from customer object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { orders, ...customerProfile } = customer;

    return (
        <div className="min-h-screen bg-[#f8f9fa] py-8 font-sans text-zinc-900">
            <ProfileForm customer={customerProfile} orders={serializedOrders} />
        </div>
    );
}
