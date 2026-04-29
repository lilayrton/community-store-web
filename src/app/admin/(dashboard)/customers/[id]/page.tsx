import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CustomerProfileForm from "./CustomerProfileForm";

export default async function CustomerProfilePage({ params }: { params: { id: string } }) {
    const { id } = params;

    const customer = await prisma.user.findUnique({
        where: { id },
        include: {
            orders: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!customer) {
        notFound();
    }

    // Serialize Decimal to number for Client Component
    const serializedOrders = customer.orders.map(order => ({
        ...order,
        total: order.total.toNumber()
    }));

    // Exclude orders from customer object to avoid passing Decimal types
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { orders, ...customerProfile } = customer;

    // Cast to match updated interface until Prisma Client is regenerated
    const customerProps = {
        ...customerProfile,
        isActive: (customerProfile as any).isActive ?? true,
        assignedStore: (customerProfile as any).assignedStore ?? "alsina"
    };

    return <CustomerProfileForm customer={customerProps} orders={serializedOrders} />;
}
