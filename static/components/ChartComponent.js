const ChartComponent = {
    props: ['chartId', 'chartLabel', 'chartData', 'chartLabels'],
    template: `<canvas :id="chartId"></canvas>`,
    mounted() {
        const ctx = document.getElementById(this.chartId).getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.chartLabels,
                datasets: [{
                    label: this.chartLabel,
                    data: this.chartData,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

export default ChartComponent;