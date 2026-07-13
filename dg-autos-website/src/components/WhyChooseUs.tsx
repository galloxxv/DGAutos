function WhyChooseUs() {
    const reasons = [
        {
            title: "Honest Pricing",
            description:
                "Clear estimates and straightforward recommendations without unnecessary repairs.",
        },
        {
            title: "Quality Work",
            description:
                "Careful repairs, professional paint matching, and attention to detail.",
        },
        {
            title: "Fast Turnaround",
            description:
                "Quick repairs and efficient service without compromising quality.",
        },
        {
            title: "Customer Service",
            description:
                "Compassionate and responsive service to meet your needs.",
        },
        {
            title: "Free Estimates",
            description:
                "Bring us your vehicle or photos and we will help you understand your repair options and costs.",
        },
    ];

    return (
        <section className="bg-[#111111] py-20 text-white">
            <div className="mx-auto max-w-7xl px-6">
                <p className="mb-3 font-semibold uppercase tracking-[.25em] text-red-500">
                    Why Choose Us
                </p>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {reasons.map((reason, index) => (
                        <div key={reason.title} className="rounded-xl border border-gray-800 bg-[#1a1a1a] p-6">
                            <p className="mb-4 text-4xl font-bold text-red-600">
                                0{index + 1}
                            </p>
                            <h3 className="mb-3 text-2xl font-bold">
                                {reason.title}
                            </h3>
                            <p className="leading-7 text-gray-400">
                                {reason.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );

}

export default WhyChooseUs;