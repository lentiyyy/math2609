// Основные функции для работы с матрицами
class MatrixSolver {
    // Создание матрицы из входных данных
    getMatrixFromInput() {
        const rows = parseInt(document.getElementById('rows').value);
        const cols = parseInt(document.getElementById('cols').value);
        const matrix = [];
        
        for (let i = 0; i < rows; i++) {
            matrix[i] = [];
            for (let j = 0; j < cols; j++) {
                const value = parseFloat(document.getElementById(`cell-${i}-${j}`).value) || 0;
                matrix[i][j] = value;
            }
        }
        return matrix;
    }

    // Вычисление определителя
    determinant(matrix) {
        if (matrix.length !== matrix[0].length) {
            throw new Error('Матрица должна быть квадратной');
        }

        const n = matrix.length;
        
        if (n === 1) return matrix[0][0];
        if (n === 2) {
            return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
        }
        if (n === 3) {
            return matrix[0][0] * matrix[1][1] * matrix[2][2] +
                   matrix[0][1] * matrix[1][2] * matrix[2][0] +
                   matrix[0][2] * matrix[1][0] * matrix[2][1] -
                   matrix[0][2] * matrix[1][1] * matrix[2][0] -
                   matrix[0][1] * matrix[1][0] * matrix[2][2] -
                   matrix[0][0] * matrix[1][2] * matrix[2][1];
        }

        // Для матриц большего размера используем метод разложения
        let det = 0;
        for (let j = 0; j < n; j++) {
            const minor = this.getMinor(matrix, 0, j);
            det += matrix[0][j] * Math.pow(-1, j) * this.determinant(minor);
        }
        return det;
    }

    // Получение минора матрицы
    getMinor(matrix, row, col) {
        return matrix.filter((_, i) => i !== row)
                    .map(row => row.filter((_, j) => j !== col));
    }

    // Транспонирование матрицы
    transpose(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const result = [];
        
        for (let j = 0; j < cols; j++) {
            result[j] = [];
            for (let i = 0; i < rows; i++) {
                result[j][i] = matrix[i][j];
            }
        }
        return result;
    }

    // Обратная матрица
    inverse(matrix) {
        const det = this.determinant(matrix);
        if (det === 0) {
            throw new Error('Матрица вырожденная, обратной матрицы не существует');
        }

        const n = matrix.length;
        const adjugate = [];
        
        for (let i = 0; i < n; i++) {
            adjugate[i] = [];
            for (let j = 0; j < n; j++) {
                const minor = this.getMinor(matrix, i, j);
                const cofactor = Math.pow(-1, i + j) * this.determinant(minor);
                adjugate[i][j] = cofactor / det;
            }
        }
        
        return this.transpose(adjugate);
    }

    // Ранг матрицы
    rank(matrix) {
        // Приведение к ступенчатому виду методом Гаусса
        const m = matrix.length;
        const n = matrix[0].length;
        let rank = 0;
        
        const copy = matrix.map(row => [...row]);
        
        for (let col = 0; col < n && rank < m; col++) {
            // Ищем ненулевой элемент в столбце
            let pivotRow = -1;
            for (let row = rank; row < m; row++) {
                if (Math.abs(copy[row][col]) > 1e-10) {
                    pivotRow = row;
                    break;
                }
            }
            
            if (pivotRow === -1) continue;
            
            // Меняем строки местами
            if (pivotRow !== rank) {
                [copy[rank], copy[pivotRow]] = [copy[pivotRow], copy[rank]];
            }
            
            // Обнуляем элементы ниже ведущего
            for (let row = rank + 1; row < m; row++) {
                const factor = copy[row][col] / copy[rank][col];
                for (let j = col; j < n; j++) {
                    copy[row][j] -= factor * copy[rank][j];
                }
            }
            
            rank++;
        }
        
        return rank;
    }

    // Умножение матриц
    multiply(a, b) {
        if (a[0].length !== b.length) {
            throw new Error('Несовместимые размеры матриц для умножения');
        }
        
        const result = [];
        for (let i = 0; i < a.length; i++) {
            result[i] = [];
            for (let j = 0; j < b[0].length; j++) {
                result[i][j] = 0;
                for (let k = 0; k < b.length; k++) {
                    result[i][j] += a[i][k] * b[k][j];
                }
            }
        }
        return result;
    }
}

// Создание экземпляра решателя
const solver = new MatrixSolver();

// Функции для взаимодействия с DOM
function createMatrixInput() {
    const rows = parseInt(document.getElementById('rows').value);
    const cols = parseInt(document.getElementById('cols').value);
    const container = document.getElementById('matrix-container');
    
    if (rows > 6 || cols > 6) {
        alert('Максимальный размер матрицы - 6x6');
        return;
    }

    let html = '<div class="matrix"><table>';
    for (let i = 0; i < rows; i++) {
        html += '<tr class="matrix-row">';
        for (let j = 0; j < cols; j++) {
            html += `<td class="matrix-cell">
                <input type="number" id="cell-${i}-${j}" value="${i === j ? 1 : 0}" step="0.1">
            </td>`;
        }
        html += '</tr>';
    }
    html += '</table></div>';
    
    container.innerHTML = html;
}

function displayMatrix(matrix, title = '') {
    let html = title ? `<h3>${title}</h3>` : '';
    html += '<div class="matrix"><table>';
    
    for (let i = 0; i < matrix.length; i++) {
        html += '<tr class="matrix-row">';
        for (let j = 0; j < matrix[i].length; j++) {
            html += `<td class="matrix-cell" style="padding: 5px;">
                ${matrix[i][j].toFixed(2)}
            </td>`;
        }
        html += '</tr>';
    }
    html += '</table></div>';
    
    return html;
}

function solveMatrix() {
    const resultsDiv = document.getElementById('results');
    
    try {
        const matrix = solver.getMatrixFromInput();
        let html = '<div class="success">Матрица успешно обработана</div>';
        
        html += displayMatrix(matrix, 'Исходная матрица:');
        
        // Проверяем, квадратная ли матрица
        const isSquare = matrix.length === matrix[0].length;
        
        if (isSquare) {
            try {
                const det = solver.determinant(matrix);
                html += `<div class="result-value">Определитель: ${det.toFixed(4)}</div>`;
            } catch (e) {
                html += `<div class="error">Ошибка вычисления определителя: ${e.message}</div>`;
            }
        }
        
        // Всегда показываем ранг
        const rank = solver.rank(matrix);
        html += `<div class="result-value">Ранг матрицы: ${rank}</div>`;
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        resultsDiv.innerHTML = `<div class="error">Ошибка: ${error.message}</div>`;
    }
}

function calculateDeterminant() {
    const resultsDiv = document.getElementById('results');
    
    try {
        const matrix = solver.getMatrixFromInput();
        
        if (matrix.length !== matrix[0].length) {
            throw new Error('Определитель можно вычислить только для квадратной матрицы');
        }
        
        const det = solver.determinant(matrix);
        
        let html = displayMatrix(matrix, 'Исходная матрица:');
        html += `<div class="result-value">Определитель матрицы: ${det.toFixed(4)}</div>`;
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        resultsDiv.innerHTML = `<div class="error">Ошибка: ${error.message}</div>`;
    }
}

function transposeMatrix() {
    const resultsDiv = document.getElementById('results');
    
    try {
        const matrix = solver.getMatrixFromInput();
        const transposed = solver.transpose(matrix);
        
        let html = displayMatrix(matrix, 'Исходная матрица:');
        html += displayMatrix(transposed, 'Транспонированная матрица:');
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        resultsDiv.innerHTML = `<div class="error">Ошибка: ${error.message}</div>`;
    }
}

function inverseMatrix() {
    const resultsDiv = document.getElementById('results');
    
    try {
        const matrix = solver.getMatrixFromInput();
        
        if (matrix.length !== matrix[0].length) {
            throw new Error('Обратная матрица существует только для квадратных матриц');
        }
        
        const inverse = solver.inverse(matrix);
        
        let html = displayMatrix(matrix, 'Исходная матрица:');
        html += displayMatrix(inverse, 'Обратная матрица:');
        
        // Проверка: A * A⁻¹ = I
        const identity = solver.multiply(matrix, inverse);
        html += displayMatrix(identity, 'Проверка (A × A⁻¹):');
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        resultsDiv.innerHTML = `<div class="error">Ошибка: ${error.message}</div>`;
    }
}

function rankMatrix() {
    const resultsDiv = document.getElementById('results');
    
    try {
        const matrix = solver.getMatrixFromInput();
        const rank = solver.rank(matrix);
        
        let html = displayMatrix(matrix, 'Исходная матрица:');
        html += `<div class="result-value">Ранг матрицы: ${rank}</div>`;
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        resultsDiv.innerHTML = `<div class="error">Ошибка: ${error.message}</div>`;
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    createMatrixInput();
});