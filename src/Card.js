
const Card = ({ number, selected, index, onBubbleSelect }) => {

    const getModifierClass = () => {
        if (selected) return 'game-grid__bubble--selected';
        if (number > -1) return 'game-grid__bubble--revealed' 
    }
    
    const bubbleSelectHandler = () => {
        if (number > -1) return;
        onBubbleSelect(index);
    }

    return (
    <div onClick={bubbleSelectHandler} className={`game-grid__bubble ${getModifierClass()}`}>
        {number !== -1 && number}
    </div>)
}

export default Card;