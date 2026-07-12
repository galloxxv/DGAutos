function Hero () {
    return (
        <section className="flex min-h-screen flex-col items-center justify-center bg-[#111111] px-6 text-center text-white">
            <h2 className="mb-6 text-5xl font-extrabold md:text-7xl">
                Collision / Body / Paint / Mechanical
            </h2>
        
        <p className="mb-10 max-w-2x1 text-lg text-gray-300 md:text-xl">
            Houston's trusted collision and mechanical repair shop.
            Quality repairs, honest pricing, and fast turnaround.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
                <button className="rounded-lg bg-red-600 px-8 py-4 font-bold transition hover:bg-red-700">
                    Get Free Estimate
                </button>
                <a href="tel:8322032136" 
                className="rounded-lg border border-white px-8 py-4 font-bold transition hover:bg-white hover:text-black">
                    Call (832) 203-2136
                </a>
            </div>
        </section>
    );
}

export default Hero;