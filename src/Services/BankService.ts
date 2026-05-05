import { PrismaClient, type ClientATM, Prisma } from "@prisma/client";

export class BankService {
  private readonly taxes: Prisma.Decimal;

  constructor(
    private readonly prisma: PrismaClient,
    x: number,
  ) {
    this.taxes = new Prisma.Decimal(x);
  }

  public async ChargePayment(
    monto: number,
    sealerId: number,
    clientId: number,
  ): Promise<boolean> {
    const amount = new Prisma.Decimal(monto);
    const taxAmount = amount.mul(this.taxes);
    const totalToDeduct = amount.add(taxAmount);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const clientUpdated = await this.DeductMoney(
          totalToDeduct,
          clientId,
          tx,
        );
        if (!clientUpdated) throw new Error("Insufficient funds");

        await this.GiveMoney(amount, sealerId, tx);

        return true;
      });
    } catch (error: any) {
      console.error("Error in the transaction:", error.message);
      return false;
    }
  }

  private async GiveMoney(
    monto: Prisma.Decimal,
    clientId: number,
    tx: any,
  ): Promise<void> {
    await tx.clientATM.update({
      where: { id: clientId },
      data: {
        balance: { increment: monto },
      },
    });
  }

  private async DeductMoney(
    monto: Prisma.Decimal,
    clientId: number,
    tx: any,
  ): Promise<ClientATM | null> {
    const account = await tx.clientATM.findUnique({ where: { id: clientId } });

    if (!account || account.balance.lt(monto)) {
      return null;
    }

    return await tx.clientATM.update({
      where: { id: clientId },
      data: {
        balance: { decrement: monto },
      },
    });
  }
}
