#ifndef TANKGOOBENTITY_HPP
#define TANKGOOBENTITY_HPP

#include <AbstractMovingEntity.hpp>
#include <GameEngine.hpp>

class TankGoobEntity: public AbstractMovingEntity
{
public:
        TankGoobEntity( int posX, int posY );
        ~TankGoobEntity( void );

        bool    tick( void ) override;

private:
        void    _clearTarget( void );
        void    _updateDirection( const AbstractEntity* target );
		void 	_startSlam(void);
		bool	_tickSlam(void);

        int     _targetEntityId;
        int     _dirX;
        int     _dirY;
		int 	_slamFrame;
		int		_slamCooldown;
		int		_slamPhaseTicks;

        static const float      _aggroRange;
        static const float      _aggroLoseRange;
        static const float      _attackRange;
        static const float      _moveSpeed;
		static const float		_slamHitboxScale;
		static const int		_slamDamage;
		static const int		_slamCooldownTicks;
		static const int 		_slamAnimationFrames;
		static const int		_slamPrepareTicks;
		static const int		_slamChargeTicks;
		static const int		_slamImpactTicks;
		static const int		_slamRecoveryTicks;
};

#endif