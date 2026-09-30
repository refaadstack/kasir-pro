import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTenant } from '@/lib/tenant'
import type { StoreSettings } from '@prisma/client'

export const dynamic = 'force-dynamic'

const ALLOWED_FIELDS = [
  'store_name',
  'store_address',
  'store_phone',
  'receipt_footer',
  'paper_width',
  'logo_url',
  'tax_percent',
  'service_charge_percent',
  'receipt_prefix',
  'trx_code_format',
] as const

const FIELD_MAP: Record<string, keyof StoreSettings> = {
  store_name: 'storeName',
  store_address: 'storeAddress',
  store_phone: 'storePhone',
  receipt_footer: 'receiptFooter',
  paper_width: 'paperWidth',
  logo_url: 'logoUrl',
  tax_percent: 'taxPercent',
  service_charge_percent: 'serviceChargePercent',
  receipt_prefix: 'receiptPrefix',
  trx_code_format: 'trxCodeFormat',
}

function serialize(s: StoreSettings) {
  return {
    store_name: s.storeName,
    store_address: s.storeAddress,
    store_phone: s.storePhone,
    receipt_footer: s.receiptFooter,
    paper_width: s.paperWidth,
    logo_url: s.logoUrl,
    tax_percent: s.taxPercent,
    service_charge_percent: s.serviceChargePercent,
    receipt_prefix: s.receiptPrefix,
    trx_code_format: s.trxCodeFormat,
  }
}

const DEFAULT_SETTINGS = {
  store_name: 'KasirPro',
  store_address: '',
  store_phone: '',
  receipt_footer: 'Terima kasih!',
  paper_width: '58mm',
  logo_url: null as string | null,
  tax_percent: 0,
  service_charge_percent: 0,
  receipt_prefix: 'TRX',
  trx_code_format: 'PREFIX-TIMESTAMP-RANDOM',
}

export async function GET() {
  try {
    const ctx = await requireTenant()
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const settings = await prisma.storeSettings.findUnique({ where: { id: ctx.tenant.id } })
    return NextResponse.json(settings ? serialize(settings) : DEFAULT_SETTINGS)
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(DEFAULT_SETTINGS)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ctx = await requireTenant()
    if (!ctx || !['SUPERADMIN', 'MANAGER'].includes(ctx.session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const updateData: Record<string, unknown> = {}
    for (const key of ALLOWED_FIELDS) {
      if (key in body) updateData[FIELD_MAP[key]] = body[key]
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Tidak ada data yang diupdate' }, { status: 400 })
    }

    const settings = await prisma.storeSettings.upsert({
      where: { id: ctx.tenant.id },
      create: {
        id: ctx.tenant.id,
        tenantId: ctx.tenant.id,
        storeName: (updateData.storeName as string) ?? DEFAULT_SETTINGS.store_name,
        storeAddress: (updateData.storeAddress as string) ?? DEFAULT_SETTINGS.store_address,
        storePhone: (updateData.storePhone as string) ?? DEFAULT_SETTINGS.store_phone,
        receiptFooter: (updateData.receiptFooter as string) ?? DEFAULT_SETTINGS.receipt_footer,
        paperWidth: (updateData.paperWidth as string) ?? DEFAULT_SETTINGS.paper_width,
        logoUrl: (updateData.logoUrl as string) ?? DEFAULT_SETTINGS.logo_url,
        taxPercent: (updateData.taxPercent as number) ?? DEFAULT_SETTINGS.tax_percent,
        serviceChargePercent:
          (updateData.serviceChargePercent as number) ?? DEFAULT_SETTINGS.service_charge_percent,
        receiptPrefix: (updateData.receiptPrefix as string) ?? DEFAULT_SETTINGS.receipt_prefix,
        trxCodeFormat: (updateData.trxCodeFormat as string) ?? DEFAULT_SETTINGS.trx_code_format,
      },
      update: updateData,
    })

    await prisma.auditLog.create({
      data: {
        userId: ctx.session.id,
        action: 'UPDATE_SETTINGS',
        detail: `Updated: ${Object.keys(updateData).join(', ')}`,
        tenantId: ctx.tenant.id,
      },
    })

    return NextResponse.json(serialize(settings))
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate pengaturan', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
