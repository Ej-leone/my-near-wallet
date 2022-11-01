import React, { FC } from 'react';

type IconProps = {
    color?: string
}

const StakingIcon: FC<IconProps> = ({ color = 'var(--mnw-color-6)' }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 21 21" fill="none">
            <path
                fill={color}
                fillRule="evenodd"
                d="M.993 1.211c.068-.475.489-.807.94-.742.587.084 1.525.28 2.475.602.93.315 1.975.782 2.693 1.456 1.333 1.253 2.189 3.331 2.458 4.2.141.454-.096.946-.53 1.1-.434.155-.9-.087-1.04-.54-.238-.764-.982-2.503-2-3.46-.457-.43-1.236-.809-2.107-1.103-.48-.163-.957-.29-1.372-.382-.174 1.615-.123 3.677 1.642 5.656.647.726 1.686 1.42 2.801 1.966.956.468 1.899.796 2.596.944a9.81 9.81 0 0 1 .386-1.87c.322-1.024.886-2.154 1.865-2.888 1.772-1.329 4.016-1.65 4.95-1.65a.75.75 0 0 1 .74.873 12.566 12.566 0 0 1-.653 2.323c-.344.889-.849 1.876-1.556 2.584-1.238 1.238-2.269 1.928-2.695 2.14a.75.75 0 1 1-.671-1.34c.24-.12 1.143-.698 2.305-1.86.492-.492.904-1.255 1.218-2.066.143-.368.26-.73.351-1.06-.894.154-2.101.515-3.089 1.256-.62.466-1.056 1.253-1.334 2.137A8.082 8.082 0 0 0 11 11.75v4.795a6.231 6.231 0 0 1 3.54 1.66.75.75 0 1 1-1.03 1.09A4.73 4.73 0 0 0 10.25 18a4.73 4.73 0 0 0-3.26 1.295.75.75 0 0 1-1.03-1.09 6.232 6.232 0 0 1 3.54-1.66v-3.88c-.91-.15-2.11-.561-3.263-1.126-1.204-.591-2.451-1.395-3.298-2.345C.276 6.209.739 2.98.989 1.234l.004-.023Z"
                clipRule="evenodd"
            />
        </svg>
    );
};

export default StakingIcon;
