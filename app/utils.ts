export const generateRandomMatrix = (): number[][] => {
    const rows = 3;
    const cols = 4;
    const matrix = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            row.push(Math.floor(Math.random() * 10)); // Random number between 0 and 9
        }
        matrix.push(row);
    }
    return matrix;
};

// Swap two rows randomly
const swapRows = (matrix: number[][]): { newMatrix: number[][], operation: string } => {
    const rows = matrix.length;
    const i = Math.floor(Math.random() * rows);
    let j;
    do {
        j = Math.floor(Math.random() * rows);
    } while (i === j);
    const newMatrix = matrix.map(row => [...row]);
    [newMatrix[i], newMatrix[j]] = [newMatrix[j], newMatrix[i]];
    const operation = `R${i + 1} ↔ R${j + 1}`;
    return { newMatrix, operation };
};

// Multiply a row by a scalar
const multiplyRowByScalar = (matrix: number[][]): { newMatrix: number[][], operation: string } => {
    const rows = matrix.length;
    const i = Math.floor(Math.random() * rows);
    const n = Math.floor(Math.random() * 9) + 1; // Random non-zero integer between 1 and 9
    const newMatrix = matrix.map(row => [...row]);
    for (let k = 0; k < matrix[0].length; k++) {
        newMatrix[i][k] *= n;
    }
    const operation = `R${i + 1} → ${n}R${i + 1}`;
    return { newMatrix, operation };
};

// Add a multiple of one row to another
const addMultipleOfRow = (matrix: number[][]): { newMatrix: number[][], operation: string } => {
    const rows = matrix.length;
    const i = Math.floor(Math.random() * rows);
    let j;
    do {
        j = Math.floor(Math.random() * rows);
    } while (i === j);
    const n = Math.floor(Math.random() * 9) + 1; // Random non-zero integer between 1 and 9
    const newMatrix = matrix.map(row => [...row]);
    for (let k = 0; k < matrix[0].length; k++) {
        newMatrix[i][k] += n * matrix[j][k];
    }
    const operation = `R${i + 1} → R${i + 1} + ${n}R${j + 1}`;
    return { newMatrix, operation };
};

// Apply a random row operation
export const applyRandomRowOperation = (matrix: number[][]): { newMatrix: number[][], operation: string } => {
    const operations = [swapRows, multiplyRowByScalar, addMultipleOfRow];
    const randomOperation = operations[Math.floor(Math.random() * operations.length)];
    return randomOperation(matrix);
};

// Apply a given row operation
export const applyOperation = (matrix: number[][], operation: string): number[][] => {
    const newMatrix = matrix.map(row => [...row]);
    const [, rowNum1, op, rowNum2] = operation.match(/R(\d+)\s*([↔→+])\s*(?:(\d+)R(\d+)|R(\d+)|(\d+)R(\d+))?/) || [];

    switch (op) {
        case '↔': // swap
            [newMatrix[Number(rowNum1) - 1], newMatrix[Number(rowNum2) - 1]] = 
            [newMatrix[Number(rowNum2) - 1], newMatrix[Number(rowNum1) - 1]];
            break;
        case '→': // multiply
            const scalar = Number(rowNum2);
            newMatrix[Number(rowNum1) - 1] = newMatrix[Number(rowNum1) - 1].map(val => val * scalar);
            break;
        case '+': // add multiple of another row
            const [, , , scalar2, sourceRow] = operation.match(/R(\d+)\s*→\s*R\1\s*\+\s*(\d+)R(\d+)/) || [];
            for (let i = 0; i < newMatrix[0].length; i++) {
                newMatrix[Number(rowNum1) - 1][i] += Number(scalar2) * newMatrix[Number(sourceRow) - 1][i];
            }
            break;
    }

    return newMatrix;
};

// Function to generate options with checks to prevent reverse operations
export const generateOptions = (
    correctOperation: string,
    matrixA: number[][],
    matrixB: number[][]
): string[] => {
    const generateRandomOperation = (matrix: number[][]): string => {
        if (!matrix || matrix.length === 0) {
            console.error('Invalid matrix provided to generateRandomOperation');
            return correctOperation; // fallback to correct operation if matrix is invalid
        }

        const rows = matrix.length;
        const operationType = Math.floor(Math.random() * 3); // 0: swap, 1: multiply, 2: add multiple

        switch (operationType) {
            case 0: // swap rows
                const i = Math.floor(Math.random() * rows);
                let j;
                do {
                    j = Math.floor(Math.random() * rows);
                } while (i === j);
                return `R${i + 1} ↔ R${j + 1}`;

            case 1: // multiply row by scalar
                const row = Math.floor(Math.random() * rows);
                const scalar = Math.floor(Math.random() * 9) + 1; // Random non-zero integer between 1 and 9
                return `R${row + 1} → ${scalar}R${row + 1}`;

            case 2: // add multiple of one row to another
                const i2 = Math.floor(Math.random() * rows);
                let j2;
                do {
                    j2 = Math.floor(Math.random() * rows);
                } while (i2 === j2);
                const n = Math.floor(Math.random() * 9) + 1; // Random non-zero integer between 1 and 9
                return `R${i2 + 1} → R${i2 + 1} + ${n}R${j2 + 1}`;

            default:
                return correctOperation; // fallback, should never happen
        }
    };

    if (!matrixA || matrixA.length === 0) {
        console.error('Invalid matrixA provided to generateOptions');
        return [correctOperation]; // return only the correct operation if matrixA is invalid
    }

    const selectedOptions = [correctOperation];
    const reverseOperation = correctOperation.includes('↔')
        ? correctOperation.split(' ↔ ').reverse().join(' ↔ ')
        : ''; // Handle reverse swap check for swaps

    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loop

    while (selectedOptions.length < 4 && attempts < maxAttempts) {
        const randomOperation = generateRandomOperation(matrixA);

        // Ensure no reverse operations are added
        if (!selectedOptions.includes(randomOperation) && randomOperation !== reverseOperation) {
            const resultMatrix = applyOperation(matrixA, randomOperation);
            if (!matricesEqual(resultMatrix, matrixB)) {
                selectedOptions.push(randomOperation);
            }
        }
        attempts++;
    }

    // If we couldn't generate 4 unique options, fill the rest with dummy options
    while (selectedOptions.length < 4) {
        selectedOptions.push(`Dummy Option ${selectedOptions.length + 1}`);
    }

    // Shuffle the options
    for (let i = selectedOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [selectedOptions[i], selectedOptions[j]] = [selectedOptions[j], selectedOptions[i]];
    }

    return selectedOptions;
};

// Helper function to check if two matrices are equal
const matricesEqual = (matrix1: number[][] | undefined, matrix2: number[][] | undefined): boolean => {
    if (!matrix1 || !matrix2) return false;
    if (matrix1.length !== matrix2.length) return false;
    return matrix1.every((row, i) => 
        row && matrix2[i] && row.length === matrix2[i].length && row.every((val, j) => val === matrix2[i][j])
    );
};
