import SectionTitle from "./SectionTitle";

function Services() {
    const services = [
        {
            title: "Collision Repair",
            description: "Comprehensive collision repair services for all makes and models."
        },
        {
            title: "Paint & Body",
            description: "Color matching, dent repair, panel replacement, and professional refinishing."
        },
        {
            title: "Mechanical Repair",
            description: "Expert mechanical repair services to keep your vehicle running smoothly."
        },
        {
            title: "Insurance Claims",
            description: "We work with insurance companies to simplify your repair process."
        },
    ];

    return (
        <section id="services" className="bg-[#181818] py-20 text-white">
            <div className="mx-auto max-w-7x1 px-6">
               <SectionTitle
               eyebrow="Our Services"
               title="Complete Automotive Repair"
               description="Everything you need under one roof."
               />
            "

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {services.map((service) => (
                        <div
                            key={service.title}
                            className="rounded-xl border border-gray-70 bg-[#222222] p-6 transition hover:border-red-600 hover:shadow-lg"
                        >
                            <h3 className="mb-4 text 2x1 font-bold text-red-500">
                                {service.title}
                            </h3>
                            <p className="text-gray-300">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
export default Services;