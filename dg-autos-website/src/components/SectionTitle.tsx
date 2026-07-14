type SectionTitleProps = {
eyebrow: string;
title: string;
description?: string;
};

function SectionTitle({
eyebrow,
title,
description,
}: SectionTitleProps) {
return (
<div className="mb-12 text-center">
<p className="mb-3 font-semibold uppercase tracking-[0.25em] text-red-500">
{eyebrow}
</p>

<h2 className="text-4xl font-bold md:text-5xl">
{title}
</h2>

{description && (
<p className="mx-auto mt-4 max-w-2xl text-gray-400">
{description}
</p>
)}
</div>
);
}

export default SectionTitle;