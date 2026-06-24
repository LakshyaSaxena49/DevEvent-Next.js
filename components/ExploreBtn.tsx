'use client'
import Image from 'next/image'

const ExploreBtn = () => {
    const handleScroll = () => {
        const element = document.getElementById('events');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <button type="button" id="explore-btn" onClick={handleScroll}>
            <a href="#events">
                Explore Events
                <Image src="/icons/arrow-down.svg" alt="Arrow down" width={24} height={24} className="h-auto" />
            </a>
        </button>
    )
}

export default ExploreBtn
