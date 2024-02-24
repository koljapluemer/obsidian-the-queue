const cards =
    [

        {
            name: "banana",
            priority: 1
        },
        {
            name: "apple",
            priority: 20
        },
        {
            name: "cherry",
            priority: 300
        },
        {
            name: "date",
            priority: 4000
        },
        {
            name: "elderberry",
            priority: 50000
        }
    ];
console.log(cards);

function selectRandomCard(cards) {
    // sort reversed priority
    const sortedCards = cards.sort((a, b) => b.priority - a.priority);
    const randomValue = Math.random();
    // (e^x - 1) / (e - 1)
    // (could put a different pdf, in that case replace all `Math.exp`)
    const pdfValueNormalized = (Math.exp(randomValue) - Math.exp(0)) / (Math.exp(1) - Math.exp(0));
    const amountOfCards = sortedCards.length;
    const indexToSelect = Math.floor(pdfValueNormalized * amountOfCards);
    return sortedCards[indexToSelect];
}

function main() {
    // pick 1000 random cards, count how many times each card was picked
    const cardCounts = {};
    for (let i = 0; i < 10000; i++) {
        const randomCard = selectRandomCard(cards);
        if (cardCounts[randomCard.name]) {
            cardCounts[randomCard.name]++;
        } else {
            cardCounts[randomCard.name] = 1;
        }
    }
    const sortedCardCounts = Object.keys(cardCounts).sort((a, b) => cardCounts[a] - cardCounts[b]);
    console.log('CARD COUNTS', sortedCardCounts.map(card => `${card}: ${cardCounts[card]}`));
}

main();