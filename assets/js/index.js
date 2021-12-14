'use strict'

function calculate() {
    document.getElementById('head').innerHTML = ''
    document.getElementById('body').innerHTML = ''
    let link = document.querySelector('a.btn')
    if (link) {
        link.parentNode.removeChild(link)
    }

    const salaries = getByClass('salary').filter(x => x.value)
    const bills = getByClass('bill').filter(x => x.value)

    const results = new Matrix(salaries, bills).results

    if (results.length) {
        const thead = results[0]
        const tbody = results.slice(1)

        document.getElementById('head').append(...el.row(el.head(...thead)))
        document.getElementById('body').append(...el.row(...tbody.map(r => el.cell(...r))))

        const content = Matrix.toCsv(results)
        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob)

        link = el.new('a', 'download', ['class', 'btn'], ['download', 'results.csv'])
        link.href = url

        document.body.append(link)
    }

    return results
}

function add(event) {
    const parent = attr(event.target, 'data-parent')
    const id = attr(event.target, 'data-id')
    const cl = attr(event.target, 'data-class')

    const length = getByClass(cl).length + 1

    document.getElementById(parent).append(el.formGroup(Math.random().toString(16).substring(2), cl, id + ' ' + length))

    main()
}

function remove(event) {
    const id = attr(event.target, 'data-for')
    document.getElementById(id).parentNode.remove()
    calculate()
}

function main() {
    getByClass('btn-remove').map(btn => btn.onclick = remove)
    getByClass('btn-add').map(btn => btn.onclick = add)
}

main()