"use client";

import NextLink from "next/link";
import VendorLogo from "../shared/VendorLogo";
import MissingDataBadge from "../shared/MissingDataBadge";
import { formatCurrency, formatContextWindow } from "@/lib/utils";

interface PricingRowAPIProps {
    type: "api";
    model: {
        slug: string;
        canonicalName: string;
        vendorSlug: string;
        vendorName: string;
        contextWindow: number | null;
    };
    pricing: {
        input1m: number;
        output1m: number;
        cached1m: number | null;
        batchIn1m: number | null;
        batchOut1m: number | null;
    };
    sourceUrl: string | null;
    rank: number;
}

interface PricingRowConsumerProps {
    type: "consumer";
    model: {
        slug: string;
        canonicalName: string;
        vendorSlug: string;
        vendorName: string;
        contextWindow: number | null;
    };
    plan: {
        planName: string;
        monthlyUsd: number;
        usageLimits: string | null;
    };
    sourceUrl: string | null;
    rank: number;
}

type PricingRowProps = PricingRowAPIProps | PricingRowConsumerProps;

export default function PricingRow(props: PricingRowProps) {
    const { type, model, rank, sourceUrl } = props;

    return (
        <tr className="transition-colors group hover:bg-hover">
            <td className="py-4 px-4 text-sm text-muted text-center border-b border-line w-12">
                {rank}
            </td>
            <td className="py-4 px-4 text-sm font-medium border-b border-line">
                <NextLink href={`/model/${model.slug}`} className="hover:underline text-primary">
                    {model.canonicalName}
                </NextLink>
            </td>
            <td className="py-4 px-4 text-sm border-b border-line">
                <VendorLogo vendor={model.vendorSlug} showName />
            </td>

            {type === "api" ? (
                <>
                    <td className="py-4 px-4 text-sm text-center border-b border-line">
                        {formatCurrency(props.pricing.input1m, "USD", 4)}
                    </td>
                    <td className="py-4 px-4 text-sm text-center border-b border-line">
                        {formatCurrency(props.pricing.output1m, "USD", 4)}
                    </td>
                    <td className="py-4 px-4 text-sm text-center text-muted border-b border-line">
                        {props.pricing.cached1m != null ? formatCurrency(props.pricing.cached1m, "USD", 4) : <MissingDataBadge />}
                    </td>
                    <td className="py-4 px-4 text-sm text-center text-muted border-b border-line">
                        {props.pricing.batchIn1m != null ? formatCurrency(props.pricing.batchIn1m, "USD", 4) : <MissingDataBadge />}
                    </td>
                    <td className="py-4 px-4 text-sm text-center text-muted border-b border-line">
                        {props.pricing.batchOut1m != null ? formatCurrency(props.pricing.batchOut1m, "USD", 4) : <MissingDataBadge />}
                    </td>
                    <td className="py-4 px-4 text-sm text-center text-muted border-b border-line">
                        {model.contextWindow != null ? formatContextWindow(model.contextWindow) : <MissingDataBadge />}
                    </td>
                    <td className="py-4 px-4 text-sm text-center border-b border-line">
                        {sourceUrl ? (
                            <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                                Source
                            </a>
                        ) : <MissingDataBadge />}
                    </td>
                </>
            ) : (
                <>
                    <td className="py-4 px-4 text-sm text-center border-b border-line text-primary">
                        {props.plan.planName}
                    </td>
                    <td className="py-4 px-4 text-sm text-center border-b border-line font-medium text-emerald-600">
                        {formatCurrency(props.plan.monthlyUsd, "USD", 2)} / mo
                    </td>
                    <td className="py-4 px-4 text-sm text-muted border-b border-line">
                        {props.plan.usageLimits ? props.plan.usageLimits : <MissingDataBadge />}
                    </td>
                    <td className="py-4 px-4 text-sm text-center border-b border-line">
                        {sourceUrl ? (
                            <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                                Source
                            </a>
                        ) : <MissingDataBadge />}
                    </td>
                </>
            )}
        </tr>
    );
}
