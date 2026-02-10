import { Chart } from 'chart.js';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';
import 'chartjs-adapter-date-fns';

Chart.register(
    MatrixController,
    MatrixElement
)
