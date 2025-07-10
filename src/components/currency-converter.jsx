import React, { useEffect } from 'react'
import {useState} from "react";
import CurrencyDropdown from './dropdown';
import { HiArrowsRightLeft } from 'react-icons/hi2';

const CurrencyConverter = () => {

    const [currencies, setCurrencies] = useState([])
    const [amount, setAmount] = useState(1)

    const [fromCurrency, setFromCurrency] = useState("EUR")
    const [toCurrency, setToCurrency] = useState("MYR")

    const [convertedAmount, setConvertedAmount] = useState(null)
    const [exchangeRate, setExchangeRate] = useState(null)
    const [converting, setConverting] = useState(false)

    const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem("favorites")) || ['MYR', 'AUD'])

    // currencies - https://api.frankfurter.dev/v1/currencies
    const fetchCurrencies = async () => {
        try {
            const res = await fetch("https://api.frankfurter.dev/v1/currencies")
            const data = await res.json()

            setCurrencies(Object.keys(data))
        } catch (error) {
            console.error('Error Fetching', error)
        }
    }

    useEffect(() => {
      fetchCurrencies()
    
    }, [])

    console.log(currencies)

    // conversion - https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}
    const convertCurrency = async() => {
        if(!amount) return

        setConverting(true)

        try {
            const res = await fetch(`https://api.frankfurter.dev/v1/latest?amount=${amount}&base=${fromCurrency}&symbols=${toCurrency}`)
            const data = await res.json()

           setConvertedAmount(data.rates[toCurrency] + " " + toCurrency)

           // Calculate rate per 1 unit
           const resExcRate = await fetch(`https://api.frankfurter.dev/v1/latest?amount=1&base=${fromCurrency}&symbols=${toCurrency}`)
           const dataExcRate = await resExcRate.json()
           setExchangeRate("1 " + fromCurrency + " = " + dataExcRate.rates[toCurrency] + " " + toCurrency)

        } catch (error) {
            console.error('Error Converting', error)
        } finally {
            setConverting(false)
        }
    }

    const handleFavorite = (currency) => {
        let updatedFavorites = [...favorites]

        if(favorites.includes(currency)){ //remove from favorites
            updatedFavorites = updatedFavorites.filter((fav) => fav !== currency)
        }else{
            updatedFavorites.push(currency)
        }

        setFavorites(updatedFavorites)
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites)) //add updatedFavorites to "favorites" in localStorage
    }

    const swapCurrencies = () => {
        setFromCurrency(toCurrency)
        setToCurrency(fromCurrency)
    }
    

    

  return (
    <div className='max-w-xl mx-auto my-10 p-5 bg-white rounded-lg shadow-md'>
        <h2 className='mb-5 text-3xl font-semibold text-gray-700'>Currency Converter</h2>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-2 items-end'>
            <CurrencyDropdown favorites={favorites} currencies={currencies} currency={fromCurrency} setCurrency={setFromCurrency} title='From:' handleFavorite={handleFavorite}/>
                {/* swap button */}
                <div className='flex justify-center -mb-5 sm:mb-0'>
                    <button onClick={swapCurrencies} className='p-2 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300'>
                        <HiArrowsRightLeft className='text-xl text-gray-700' />
                    </button>
                </div>
            <CurrencyDropdown favorites={favorites} currencies={currencies} currency={toCurrency} setCurrency={setToCurrency} title='To:' handleFavorite={handleFavorite}/>
        </div>

        <div className='mt-4'>
            <label htmlFor='amount' className='block text-md font-medium text-gray-700'>Amount:</label>
            <input type="number" className='w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1' 
                    onChange={(e) => setAmount(e.target.value)} value={amount}/>
        </div>

        <div className='flex justify-end mt-6'>
            <button onClick={convertCurrency} 
                    className={`px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                        ${converting?"animate-pulse" : ""}`
                    }>
                Convert
            </button>
        </div>

        {convertedAmount && (
            <>
                <div className='mt-4 text-lg font-medium text-right text-green-600'>
                    Converted Amount: {convertedAmount}
                </div>

                <div className='mt-4 text-lg font-medium text-right text-red-600'>
                    {exchangeRate}
                </div>
            </>
        )}

    </div>
  )
}

export default CurrencyConverter