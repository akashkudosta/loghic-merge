import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const CoinPriceChartsComponent = ({ data }) => {
    const getColor = (data) => {
        if (!data || data.length < 2) return '#2ECC71'; // Default to green if no data
        return data[data.length - 1] >= data[0] ? '#2ECC71' : '#E63946'; // Green if increasing, Red if decreasing
    };
    
    const options = {
        chart: {
          type: 'area',
          backgroundColor: 'transparent',
          height: 200,
          zooming: {
              type: 'x'
          },
          panning: true,
          panKey: 'shift',
          scrollablePlotArea: {
              minWidth: 600
          }
        },
        title: {
          text: null,
        },
        series: [
          {
            name: 'Price',
            data: data,
            color: getColor(data), // Dynamically set color
            fillOpacity: 0.2, 
            lineColor: getColor(data),
            marker: {
                enabled: false,
                states: {
                    hover: {
                        enabled: false
                    }
                }
            },
            threshold: null
          },
        ],
        xAxis: {
          labels: { enabled: false },
          lineWidth: 0,
          tickLength: 0,
          minRange: 5,
          title: {
            text: null
          }
        },
        yAxis: {
          startOnTick: true,
          endOnTick: false,
          maxPadding: 0.35,
          labels: { enabled: false },
          gridLineWidth: 0,
          title: { text: null },
        },
        tooltip: {
          shared: true,
          useHTML: true,
          formatter: function() {
            return `<div style="font-size: 12px; padding: 8px;">
                <div style="margin-bottom: 5px;">${Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x)}</div>
                <div style="display: flex; align-items: center; margin: 3px 0;">
                    <span style="color:${this.color}; margin-right: 5px;">\u25CF</span>
                    <span style="font-weight: bold;">Price: $${this.y}</span>
                </div>
            </div>`;
          },
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#ccc',
          borderRadius: 8,
          shadow: true,
        },
        legend: {
          enabled: false,
        },
        credits: {
          enabled: false,
        },
        plotOptions: {
          area: {
            fillOpacity: 0.2,
            marker: {
                enabled: false,
                states: {
                    hover: {
                        enabled: false
                    }
                }
            },
            states: {
                hover: {
                    lineWidth: 2
                }
            }
          }
        }
      };

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
    />
  );
};

export default CoinPriceChartsComponent;
