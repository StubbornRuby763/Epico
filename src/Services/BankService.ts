import { PrismaClient, type ClientATM, Prisma } from "@prisma/client";

export class BankService {
  private readonly taxes: Prisma.Decimal;

  constructor(
    private readonly prisma: PrismaClient,
    x: number,
  ) {
    this.taxes = new Prisma.Decimal(x);
  }
  public getTaxRate(): number {
    return this.taxes.toNumber();
  }

  public async ChargePayment(
    monto: number,
    sealerId: number,
    clientId: number,
  ): Promise<boolean> {
    const amount = new Prisma.Decimal(monto);
    const taxAmount = amount.mul(this.taxes);
    const totalToDeduct = amount
      .add(taxAmount)
      .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
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
  public async RegisterUser(
    userData: Prisma.ClientATMCreateInput,
  ): Promise<ClientATM | null> {
    try {
      return await this.prisma.clientATM.create({
        data: userData,
      });
    } catch (error) {
      console.error("Error to RegisterUser:", error);
      return null;
    }
  }

  public async TryAccess(
    user: string,
    pass: string,
  ): Promise<ClientATM | null> {
    const account = await this.prisma.clientATM.findUnique({
      where: { user: user },
    });

    if (!account || account.password !== pass) {
      return null;
    }

    return account;
  }
  public async GetUserById(id: number): Promise<ClientATM | null> {
    return await this.prisma.clientATM.findUnique({
      where: { id: id },
    });
  }
  public async TopUp(userId: number, monto: number): Promise<ClientATM | null> {
    const amount = new Prisma.Decimal(monto);
    try {
      return await this.prisma.clientATM.update({
        where: { id: userId },
        data: {
          balance: { increment: amount },
        },
      });
    } catch (error) {
      console.error("Error in TopUp:", error);
      return null;
    }
  }
}
