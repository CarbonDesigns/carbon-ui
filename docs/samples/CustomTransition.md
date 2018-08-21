function customTransition(oldArtboard:TArtboard&IAnimatable, newArtboard:TArtboard&IAnimatable) : Promise<void> {
    let oldPropsAfter = { opacity: 1 }
    let newPropsAfter = { opacity: 1 };
    let animation:IAnimationOptions = {
        duration:5000,
        curve:EasingType.EaseInExpo
    }
    newArtboard.opacity = 0;
    return Promise.all([
        oldArtboard.animate(oldPropsAfter, animation),
        newArtboard.animate(newPropsAfter, animation)
    ]) as any;
}

Rectangle_3.onClick = () => {
    navigationController.navigateTo("Artboard 2", {
        transitionFunction: customTransition
    })
}