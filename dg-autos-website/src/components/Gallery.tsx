function Gallery() {
    const projects = [
        {
            title: "Collision Repair",
            vehicle: "Front-end damage restoration",
        },
        {
            title: "Paint & Body",
            vehicle: "Panel repair and color matching",
        },
        {
            title: "Bumper Repair",
            vehicle: "Damage repair and refinishing",
        },
    ];

    return (
        <section id="gallery" className="bg-[#181818] py-24 text-white">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-12 text-center">
                    <p className="mb-3 font-semibold uppercase tracking-[0.25em] text-red-500">Our Work</p>
                    <h2 className="text-4xl font-bold md:text-5xl">Before & After</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-gray-400">
                        See how DG Autos restores damaged vehicles with careful bodywork,
                        professional paint matching, and attention to detail.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {projects.map((project) => (
                        <article
                            key={project.title}
                            className="overflow-hidden rounded-xl border border-gray-800 bg-[#222222]"
                        >
                            <div className="grid h-64 grid-cols-2">
                                <div className="flex items-center justify-center border-r border-gray-700 bg-gradient-to-br from-gray-800 to-black">
                                    <span className="rounded bg-black/70 px-4 py-2 font-bold">Before</span>
                                </div>
                                <div className="flex items-center justify-center bg-gradient-to-br from-red-950 to-black">
                                    <span className="rounded bg-red-600 px-4 py-2 font-bold">After</span>
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="mb-2 text-2xl font-bold">{project.title}</h3>
                                <p className="text-gray-400">{project.vehicle}</p>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <a
                        href="#contact"
                        className="inline-block rounded-lg bg-red-600 px-8 py-4 font-bold transition hover:bg-red-700"
                    >
                        Request Your Free Estimate
                    </a>
                </div>
            </div>
        </section>
    );
}

export default Gallery;

                                            