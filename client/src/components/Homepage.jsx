import CustomNavbar from "./CustomNavbar";
import { useState, useEffect } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";

export default function Homepage() {
  const [cars, setCars] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [sort, setSort] = useState("priceAsc");
  const [totalPages, setTotalPages] = useState(null);
  const [search, setSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const getCar = async (page, limit, sort, search) => {
    try {
      let { data } = await axios({
        method: "GET",
        url: "/cars",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        params: {
          page,
          limit,
          sort,
          search,
        },
      });
      // console.log(data.cars);
      setCars(data.cars);
      setTotalPages(data.pagination.totalPages);
      // console.log(cars);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getCar(page, limit, sort, search);
  }, [page, limit, sort, search]);

  const add = async (id) => {
    try {
      let { data } = await axios({
        method: "POST",
        url: `/wishList/${id}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      let carId = data.result.Car;
      setCars(carId);
      // console.log(data.result.Car);
      navigate("/wishList");
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setSearch(searchValue);
    setPage(1);
  };

  const handlePageNumber = (pageNumber) => {
    setPage(pageNumber);
  };

  const getPageNumbers = () => {
    if (!totalPages) return [];
    let pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };
  // console.log(cars);
  return (
    <>
      <CustomNavbar />
      {/* <Navbar /> */}
      <div className="pt-20 px-4">
        <h2 className="text-2xl font-semibold mb-4 mt-4">Rekomendasi</h2>
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="flex space-x-2 mb-4">
            <button
              className={`text-gray-900 ${
                sort === "priceAsc"
                  ? "bg-red-600 text-white"
                  : "bg-white text-gray-900 hover:bg-gray-100"
              }  focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2`}
              onClick={() => {
                setSort("priceAsc");
                setPage(1);
              }}
            >
              Harga Terendah
            </button>
            {/* <button className="text-gray-900 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 font-medium rounded-lg text-sm px-4 py-2">
              Mobil Terbaru
            </button> */}
            <button
              className={`text-gray-900 ${
                sort === "yearDesc"
                  ? "bg-red-600 text-white"
                  : "bg-white text-gray-900 hover:bg-gray-100"
              } focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2`}
              onClick={() => {
                setSort("yearDesc");
                setPage(1);
              }}
            >
              Tahun Terbaru
            </button>
          </div>
          <form onSubmit={handleSearch} className="flex items-center mb-4">
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search..."
              className="px-4 py-2 border rounded-lg"
            />
            <button
              type="submit"
              className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 ml-2"
            >
              Search
            </button>
          </form>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {cars.map((cars) => {
            return (
              <div
                key={cars.id}
                className="bg-white shadow-md rounded-lg overflow-hidden"
              >
                <img
                  style={{ height: "280px", width: "100%", objectFit: "cover" }}
                  className="w-full"
                  src="https://asset-2.tstatic.net/belitung/foto/bank/images/Toyota-melakukan-pembenahan-pada-sisi-eksterior-Calya-dengan-tema-tampilan-lebih-sporty-dan-modern.jpg"
                  alt="Toyota Calya 1.2 G 2022"
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg">{cars.name}</h3>
                  <div style={{ height: "60px" }}>
                    <p className="text-sm text-gray-500">
                      {cars.type} - {cars.year}
                    </p>
                    <p className="text-sm text-gray-500">Kota Tangerang</p>
                  </div>
                  <div className="flex items-center justify-between  mb-4">
                    <p className="font-bold text-red-600">
                      {new Intl.NumberFormat("ID-id", {
                        style: "currency",
                        currency: "IDR",
                      }).format(cars.price)}
                    </p>
                    <button
                      onClick={() => add(cars.id)}
                      className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 ml-auto"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center mt-4 mb-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            style={{ minWidth: "100px" }}
            className={`text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 mx-2 ${
              page <= 1 ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            Previous
          </button>
          {getPageNumbers().map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => handlePageNumber(pageNumber)}
              className={`text-gray-600 text-sm mx-2 ${
                pageNumber === page ? "font-bold" : "hover:text-black"
              }`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            style={{ minWidth: "100px" }}
            className={`text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 mx-2 ${
              page >= totalPages ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
