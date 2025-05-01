import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Box, Typography, Select, MenuItem, FormControl } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// Add custom animation to Highcharts
(function(H) {
    const animateSVGPath = (svgElem, animation) => {
        if (!svgElem || !svgElem.element) return;
        
        const length = svgElem.element.getTotalLength();
        svgElem.attr({
            'stroke-dasharray': length,
            'stroke-dashoffset': length,
            opacity: 1
        });
        svgElem.animate({
            'stroke-dashoffset': 0
        }, animation);
    };

    // Add animation to line series
    H.seriesTypes.spline.prototype.animate = function(init) {
        const series = this,
            animation = H.animObject(series.options.animation);
        if (!init) {
            animateSVGPath(series.graph, animation);
        }
    };
}(Highcharts));

const PriceComparisonChartComponent = ({ currentCompany }) => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [comparisonData, setComparisonData] = useState({
        currentCompanyData: [],
        selectedCompanyData: []
    });
    const [loading, setLoading] = useState(true);

    // Fetch companies from API
    useEffect(() => {
        if (currentCompany?.Company_Symbol) {
            fetchCompanies();
        }
    }, [currentCompany]);

    const fetchCompanies = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/companies/getPriceComparisonCompanies?Company_Categories=${currentCompany.Company_Categories}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const result = await response.json();
            // console.log('result', result);
            if (result.status && result.data) {
                // Filter out the current company from the dropdown list
                const filteredCompanies = result.data.filter(
                    company => company.Company_Symbol !== currentCompany.Company_Symbol
                );
                setCompanies(filteredCompanies);
                
                // Set first company as default for comparison
                if (filteredCompanies.length > 0) {
                    const firstCompany = filteredCompanies[0];
                    setSelectedCompany(firstCompany.Company_Symbol);
                    updateComparisonData(firstCompany);
                }
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching companies:', error);
            setLoading(false);
        }
    };

    // Function to determine color based on trend
    const getColor = (coinData) => {
        if (!coinData || coinData.length < 2) return '#2ECC71'; // Default green
        return coinData[coinData.length - 1][1] >= coinData[0][1] ? '#2ECC71' : '#E63946'; // Green if up, Red if down
    };

    // Handle company selection change
    const handleCompanyChange = (event) => {
        const selectedSymbol = event.target.value;
        setSelectedCompany(selectedSymbol);
        const selectedComp = companies.find(comp => comp.Company_Symbol === selectedSymbol);
        if (selectedComp) {
            updateComparisonData(selectedComp);
        }
    };

    // Update comparison data when selected company changes
    const updateComparisonData = (selectedComp) => {
        if (!currentCompany?.CoinPrice?.Coin_Sparkline_7d) return;
        // Format current company data
        const currentCompanySparkline = currentCompany.CoinPrice.Coin_Sparkline_7d;
        const currentCompanyData = currentCompanySparkline.slice(0, 100).map((price, index) => [
            Date.now() - (currentCompanySparkline.length - index) * 1000 * 60,
            price
        ]);
        // console.log('selectedComp', selectedComp);
        // Format selected company data
        const selectedCompanySparkline = selectedComp.Coin_Sparkline_7d?.[0] || [];
        const selectedCompanyData = selectedCompanySparkline.slice(0, 100).map((price, index) => [
            Date.now() - (selectedCompanySparkline.length - index) * 1000 * 60,
            price
        ]);

        setComparisonData({
            currentCompanyData,
            selectedCompanyData
        });
    };

    const options = {
        chart: {
            type: 'spline',
            backgroundColor: 'transparent',
            height: 220,
            animation: {
                duration: 1000
            }
        },
        title: {
            text: null,
        },
        series: [
            {
                name: currentCompany?.Company_Symbol?.replace('.CRYPTO', '') || '',
                data: comparisonData.currentCompanyData,
                color: '#2ECC71',
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: false
                        }
                    }
                },
                lineWidth: 2,
                fillOpacity: 0.3,
                animation: {
                    duration: 1500
                }
            },
            {
                name: selectedCompany?.replace('.CRYPTO', '') || '',
                data: comparisonData.selectedCompanyData,
                color: '#E63946',
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: false
                        }
                    }
                },
                lineWidth: 2,
                fillOpacity: 0.3,
                animation: {
                    duration: 1500
                }
            }
        ],
        xAxis: {
            type: 'datetime',
            labels: { enabled: false },
            lineWidth: 0,
            tickLength: 0,
            animation: {
                duration: 1000
            }
        },
        yAxis: {
            labels: { enabled: false },
            gridLineWidth: 0,
            title: { text: null },
            animation: {
                duration: 1000
            }
        },
        tooltip: {
            shared: true,
            useHTML: true,
            formatter: function () {
                let tooltipHTML = `<div style="font-size: 12px; padding: 8px;">`;
                //tooltipHTML += `<div style="margin-bottom: 5px;">${Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x)}</div>`;
                this.points.forEach((point) => {
                    tooltipHTML += `<div style="display: flex; align-items: center; margin: 3px 0;">
                        <span style="color:${point.color}; margin-right: 5px;">\u25CF</span>
                        <span style="flex: 1;">${point.series.name}:</span>
                        <span style="font-weight: bold; margin-left: 5px;">$${point.y.toFixed(8)}</span>
                    </div>`;
                });
                tooltipHTML += `</div>`;
                return tooltipHTML;
            },
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#ccc',
            borderRadius: 8,
            shadow: true,
            style: {
                fontSize: '12px'
            }
        },
        legend: {
            enabled: true,
            align: 'center',
            verticalAlign: 'bottom',
            layout: 'horizontal',
            itemStyle: {
                color: '#666',
                fontWeight: 'normal',
                fontSize: '12px'
            },
            symbolRadius: 2,
            symbolWidth: 10,
            symbolHeight: 10,
            itemDistance: 20
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            spline: {
                marker: {
                    enabled: false
                }
            }
        }
    };

    if (!currentCompany) {
        return <Typography>No company data available</Typography>;
    }

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative', alignItems: 'center', mb: 2 }}>
                <FormControl style={{ marginLeft: '10px', top: '-25px', position: 'absolute', right: '10px', zIndex: 1000, }}>
                    <Box display='flex' alignItems='center' gap={1} position='relative'>
                        <Select
                            value={selectedCompany}
                            onChange={handleCompanyChange}
                            IconComponent={KeyboardArrowDownIcon}
                            minWidth='150px'
                            sx={{
                                '& .MuiOutlinedInput-notchedOutline': {
                                    border: 'none',
                                },
                                '& .MuiSelect-icon': {
                                    color: '#666',
                                    right: '8px',
                                    fontSize: '24px',
                                },
                                backgroundColor: 'transparent',
                                borderRadius: '8px',
                                position: 'relative',
                                zIndex: 1000,
                                minWidth: '150px',
                                '&:hover': {
                                    '& .MuiSelect-icon': {
                                        color: '#333',
                                    }
                                }
                            }}
                        >
                            {companies.map((company) => (
                                <MenuItem 
                                    key={company.Company_Symbol} 
                                    value={company.Company_Symbol}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                    }}
                                >
                                    <Box display='flex' alignItems='center' paddingRight='30px'>
                                        <img 
                                            src={company.Company_LogoURL} 
                                            alt={company.Company_Name}
                                            style={{ 
                                                width: '24px', 
                                                height: '24px', 
                                                borderRadius: '50%',
                                                marginRight: '8px'
                                            }}
                                        />
                                        {company.Company_Name}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                        <KeyboardArrowDownIcon style={{ position: 'absolute', zIndex: 0, right: '20px', top: '50%', transform: 'translateY(-50%)' }} />
                    </Box>
                </FormControl>
            </Box>
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
            />
        </Box>
    );
};

export default PriceComparisonChartComponent;
