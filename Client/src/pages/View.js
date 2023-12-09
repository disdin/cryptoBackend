import React, { useEffect, useState } from 'react'
import {
    LinearProgress,
    Stack,
    Autocomplete,
    Button,
    Grid,
    TextField,
    Typography
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';
import { Icon } from '@iconify/react';


const View = () => {
    const [currency, setCurrency] = useState(null);
    const [week, setWeek] = useState(null);
    const [totalPages, setTotalPages] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [finalLineData, setFinalLineData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [profit, setProfit] = useState(true);
    const [percent, setPercent] = useState(null);
    const [responseTime, setResponseTime] = useState(null);
    const [currencyOptions, setCurrencyOptions] = useState([]);
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [loadingMsg, setLoadingMsg] = useState("");

    const handleNextWeek = () => {
        setWeek(prev => prev + 1);
    };

    const handlePreviousWeek = () => {
        setWeek(prev => prev - 1);
    };

    const handleChange = (e,newValue) => {
        setCurrency(newValue);
    }

    useEffect(() => {
        const caller = async () => {
            try {
                setLoading(true);
                setLoadingMsg("Getting data for top 50 currencies for you")
                const url = `${process.env.REACT_APP_API}/getNames`;
                const res = await axios.get(url);
                console.log(res?.data);
                if (res?.data.success) {
                    // const dumArr = res?.data?.body?.map((item) => (item?.label.split(' ')[0]));
                    setCurrencyOptions(res?.data?.body);
                }
                else {
                    setError(true);
                    setErrorMsg("Error while fetching currencies, please reload or try in some time")
                }
                setLoading(false);
            } catch (error) {
                setLoading(false);
                setError(true);
                setErrorMsg("Error while fetching currencies, please reload or try in some time")
            }
        }
        caller();
    }, []);

    useEffect(() => {
        if (week) {
            let dumChartData = [...chartData];
            dumChartData.reverse();
            dumChartData = dumChartData.slice((week - 1) * 7, (week * 7))
            const dumLineData = dumChartData.map(item => {
                const obj = {
                    name: item[0].slice(0, 6),
                    value: item[1].slice(1).replace(/,/g, '')
                }
                return obj;
            });
            setFinalLineData(dumLineData);
        }
    }, [week,chartData]);

    useEffect(() => {
        const caller = async () => {
            try {
                setLoading(true);
                setLoadingMsg(`Getting Market Cap for ${currency?.label}`)
                const url = `${process.env.REACT_APP_API}/getDetails/${currency?.value?.toLowerCase()}`;
                const res = await axios.get(url);

                if (res?.data?.success) {
                    let dumArr = res?.data?.body;
                    const remainder = dumArr?.length % 7;
                    if (remainder !== 0) {
                        dumArr.splice(-remainder, remainder);
                    }
                    setChartData(dumArr);
                    let dumPages = Math.floor(dumArr?.length / 7);
                    console.log("ss - ", dumArr?.length, dumPages);
                    setTotalPages(dumPages);
                    setWeek(dumPages);
                    setResponseTime(res?.data?.time);
                }
                else {
                    setLoading(false);
                    setError(true);
                    setErrorMsg("Error while fetching data, please select another currency");
                }
                setLoading(false);
            } catch (error) {
                setError(true);
                setErrorMsg("Error while fetching data, please select another currency");
            }
        }
        if (currency) caller();
    }, [currency]);

    useEffect(() => {
        if (finalLineData && finalLineData.length > 0) {
            let first = finalLineData[0];
            let last = finalLineData[6];
            first = parseInt(first.value);
            last = parseInt(last.value);
            if (last > first) {
                setProfit(true);
                setPercent(((last - first) / first).toFixed(2));
            }
            else {
                setProfit(false);
                setPercent(((first - last) / first).toFixed(2));
            }
        }
    }, [finalLineData]);

    return (
        <>
            {loading === true ? (
                <Stack spacing={1} justifyContent="center" alignItems="center" sx={{ position: "absolute", top: "45%", width: "100%" }}>
                    <Typography sx={{color:"grey"}}>{loadingMsg}</Typography>
                    <LinearProgress sx={{ width: "80%" }}></LinearProgress>
                </Stack>
            ) : (
                <>
                    {!error &&
                        <Stack justifyContent="center" alignItems="center">
                            {responseTime && <Stack alignItems="flex-end" sx={{ width: "100%", marginTop: "0.5rem" }}>
                                <Typography variant='body1' sx={{ color: "orange", fontSize: "0.9rem", width: "35%" }}>
                                    Response Time : <span style={{ fontWeight: "600" }}>{responseTime}</span>
                                </Typography>
                            </Stack>
                            }
                            <Stack sx={{
                                display: 'flex',
                                // alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: "18px",
                                marginRight: "2rem"
                            }}>

                                <LineChart width={520} height={230} data={finalLineData} >
                                    <Line type="monotone" dataKey="value" stroke="#1976d2" />
                                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                                    <XAxis dataKey="name" />
                                    <YAxis
                                        tickFormatter={(value) =>
                                            new Intl.NumberFormat("en-US", {
                                                notation: "compact",
                                                compactDisplay: "short",
                                            }).format(value)
                                        }
                                    />
                                    <Tooltip />
                                </LineChart>

                            </Stack>
                            {percent && (
                                <Stack justifyContent="center" alignItems="center" direction="row" spacing={1} sx={{ fontWeight: "500", fontSize: "1.2rem", marginTop: "0.6rem" }}>
                                    {profit === true ?
                                        <Icon icon="bxs:up-arrow" color="green" /> :
                                        <Icon icon="bxs:down-arrow" color="red" />
                                    }
                                    <Typography sx={{ color: profit === true ? "green" : "red", fontWeight: "500", fontSize: "1.2rem", }}>
                                        {percent}% (7d)
                                    </Typography>
                                </Stack>
                            )}
                            {!percent && (
                                <Typography variant='body1' sx={{ color: "orange", fontSize: "0.9rem", width: "75%", marginTop:"1rem" }}>
                                    Please type your currency below to see it's Market Cap
                                </Typography>
                            )}
                        </Stack>
                    }
                    {error && (
                        <Stack height="85vh" justifyContent="center" alignItems="center">
                            <Typography sx={{fontSize:"1.4rem", color:"#ff5858", width:"80%"}}>{errorMsg}</Typography>
                        </Stack>
                    )}

                    <Stack sx={{ position: "absolute", bottom: "0px", width: "100%", marginBottom: "0.6rem" }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={4}>
                                <Button disabled={week === 1} onClick={handlePreviousWeek} variant="outlined" color="primary" sx={{ width: "10rem" }}>
                                    Previous Week
                                </Button>
                            </Grid>
                            <Grid item xs={4}>
                                <Autocomplete
                                    variant="primary"
                                    value={currency}
                                    onChange={handleChange}
                                    getOptionLabel={(option)=>option.label.split(' ')[0]}
                                    options={currencyOptions}
                                    isOptionEqualToValue={(option, value) => option.value === value.value}
                                    renderInput={(params) => <TextField {...params} placeholder="Select Currency" />}
                                    clearIcon={null}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <Button disabled={week === totalPages} onClick={handleNextWeek} variant="outlined" color="primary" sx={{ width: "10rem" }}>
                                    Next Week
                                </Button>
                            </Grid>
                        </Grid>
                    </Stack>
                </>
            )}

        </>
    )
}

export default View