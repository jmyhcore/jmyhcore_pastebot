weightedRandomGenerator = (list = null) => {
    if (!list && list.length < 2) return null
    weightSum = list.reduce( (acc, item) => {
        return acc + item.weight
    }, 0)

    let weightedRandom = Math.floor(Math.random() * weightSum)

    weightsArray = []

    list.forEach( (item, index, array) => {
        if (!index) weightsArray.push(item.weight)
        else weightsArray.push(item.weight + weightsArray[index-1])
    })

    
    let reply = null

    for(let i = 0; i < weightsArray.length; i++) {
        if (weightsArray[i] > weightedRandom) {
            reply = list[i]
            break
        }
    }
    return reply
}

module.exports = {
    weightedRandomGenerator
}