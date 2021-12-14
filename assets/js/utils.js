'use strict'

const usd = new Intl.NumberFormat('en-US', { currency: `USD`, style: 'currency' })
const formats = arr => arr.map(val => isNaN(val) ? val : usd.format(Math.fround(val)))
const attr = (el, attr) => el.attributes[attr].value

const el = {
    new: function (tag, content, ...attrs) {
        const el = document.createElement(tag)

        attrs.map(([name, value]) => el.setAttribute(name, value))

        if (Array.isArray(content)) {
            el.append(...content)
        }
        else if (content) {
            el.append(content)
        }

        return el
    },
    head: function (...contents) {
        return contents.map(content => el.new('th', content))
    },
    row: function (...contents) {
        return contents.map(content => el.new('tr', content))
    },
    cell: function (...contents) {
        return contents.map(content => el.new('td', content))
    },
    formGroup(id, cl, lbl) {

        const label = el.new('label', lbl, ['contenteditable', true], ['id', id])
        const input = el.new('input', '', ['class', cl], ['aria-labelledby', id], ['type', 'number'], ['min', 0], ['inputmode', 'numeric'])
        const button = el.new('button', 'remove', ['class', 'btn-remove'], ['data-for', id])

        return el.new('div', [label, el.new('div', [input, button])], ['class', 'form-group'])
    },
}

class Matrix {
    constructor(salaries, bills) {
        this.inputs = {
            salaries,
            bills,
        }
    }
    get results() {
        let matrix = this.calculate()

        if (!matrix.length) {
            return []
        }

        // totals
        matrix.push(['total', ...this.sumCols(matrix).slice(1)])
        // headings
        matrix.unshift(['bill', 'amount', ...this.inputs.salaries.map(this.label), 'overdue'])

        return matrix.map(row => formats(row))
    }
    calculate() {
        if (!this.inputs.salaries.length || !this.inputs.bills.length) {
            return []
        }

        let matrix = []
        let salaries = this.inputs.salaries.map(x => parseFloat(x.value))

        for (const bill of this.inputs.bills) {
            const due = parseFloat(bill.value)
            const total = this.sum(salaries)

            let payments = []
            for (const [i, income] of salaries.entries()) {
                let payment = this.pwyc(income, due * (income / total))

                payments.push(payment)
                salaries[i] -= payment
            }

            matrix.push([this.label(bill), due, ...payments, Math.abs(due - this.sum(payments))])
        }

        return matrix
    }
    label(el) {
        const id = attr(el, 'aria-labelledby')
        return document.getElementById(id).innerText
    }
    sumCols(arr) {
        return arr.reduce((col, row) => col.map((val, i) => val + (row[i] || 0)))
    }
    sum(arr) {
        return arr.reduce((sum, val) => sum + val)
    }
    pwyc(income, due) {
        return (due > income ? income : due) || 0
    }
    static toCsv(arr) {
        return arr.map(row => row.join(',')).join('\n')
    }
}

const getByClass = cl => [...document.getElementsByClassName(cl)]