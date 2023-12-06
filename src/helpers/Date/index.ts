export function printMonthAndYear(date?: Date): string {
  let month = '0'
  let year = '0'

  if (!date) {
    month = String(new Date(Date.now()).getMonth() + 1)
    if (Number(month) < 10) {
        month = `0${month}`
    }
    year = String(new Date(Date.now()).getFullYear())

  } else {
    month = String(new Date(date).getMonth() + 1)
    if (Number(month) < 10) {
        month = `0${month}`
    }
    year = String(new Date(Date.now()).getFullYear())
  }

  return `${month} / ${year}`
}