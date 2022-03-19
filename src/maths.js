export function sum(arr) {
  return arr.reduce((acc, curr) => acc + curr, 0)
}

export function mean(arr) {
  return sum(arr) / arr.length
}

export function max(arr) {
  let res = arr[0]
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > res) {
      res = arr[i]
    }
  }
  return res
}

export function std(arr) {
  const _mean = mean(arr)
  return Math.sqrt(
    arr.reduce((acc, v) => {
      acc + (_mean - v) ** 2
    }) / arr.length
  )
}

export function std_with_mean(arr, _mean) {
  return Math.sqrt(
    arr.reduce((acc, v) => {
      acc + (_mean - v) ** 2
    }) / arr.length
  )
}
