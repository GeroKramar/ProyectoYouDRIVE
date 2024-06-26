import Products from "@/components/Products/Products";

export default function Home() {
  return (
    <div className="bg-[#444343] text-white flex flex-col min-h-screen">
      <section className="w-full h-full flex justify-center">
        <div className="w-full bg-no-repeat bg-contain md:bg-cover md:shadow-xl h-[150px]  bg-home flex justify-center items-center md:h-[600px] bg-top">
          <div className="flex flex-col mb-16 justify-between items-center h-full ">
            <div className="flex-grow"></div>
            <a
              href="#vehiculos"
              className="w-[90px] h-[30px] mt-2 px-3 py-2 text-[10px] content-center justify-center items-center md:w-40 md:h-10 text-[#222222] md:py-5 flex md:text-base font-semibold bg-[#C4FF0D] rounded-lg shadow-lg hover:scale-105 duration-200 hover:drop-shadow-2xl hover:shadow-[#c3ff0d92] hover:cursor-pointer"
            >
              Ver catálogo
            </a>
          </div>
        </div>
      </section>

      <section
        id="vehiculos"
        className="w-full md:mt-4 flex flex-col justify-around"
      >
        <div className="flex flex-col w-full justify-center items-center">
          <h1 className="text-xl mt-4 md:text-4xl font-bold ">¡Vehiculos!</h1>
          <p className="text-sm md:text-lg text-[#dcffc1] font-bold">
            Amplia variedad y a los mejores precios del mercado
          </p>
        </div>
        <Products />
      </section>
    </div>
  );
}
