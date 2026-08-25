#ifndef LORDGOOBENTITY_HPP
#define LORDGOOBENTITY_HPP

#include <AbstractEntity.hpp>
#include <GameEngine.hpp>

class LordGoobEntity: public AbstractEntity
{
public:
        LordGoobEntity( int posX, int posY );
        ~LordGoobEntity( void );

        bool    tick( void ) override;

private:
		int		_getPhase( void ) const;
        void    _updateDirection( const AbstractEntity* target );
        void    _startPhaseOneAttack( const AbstractEntity* target );
		void	_startPhaseTwoAttack( const AbstractEntity* target);
		bool	_tickPhaseTwoAttack( void );
        bool    _tickPhaseOneAttack( void );
        void    _firePhaseOneAttack( void );
		void	_firePhaseTwoAttack( void );
		void	_firePhaseTwoFan( void );
		void	_firePhaseTwoRadial( void );
		void	_startPhaseThreeAttack( const AbstractEntity* target );
		bool	_tickPhaseThreeAttack( void );
		void	_firePhaseThreeAttack( void );
		void	_firePhaseThreeFan( void );
		void	_firePhaseThreeRadial( void );
		void	_firePhaseThreeLaser( void );

        int     _targetEntityId;
        int     _attackCooldown;
        int     _attackFrame;
        int     _attackFrameTicks;
		int		_currentPhase;
		int		_phaseTwoPattern;
		int		_phaseThreePattern;
        int     _dirX;
        int     _dirY;
        long    _aimX;
        long    _aimY;

        static const float      _attackRange;
        static const float      _projectileSpeed;
        static const float      _projectileSpawnDistance;
        static const int        _projectileDamage;
        static const int        _attackCooldownTicks;
        static const int        _attackFrameDurationTicks;
        static const int        _attackFrameCount;
		static const int		_phaseTwoCooldownTicks;
		static const int		_phaseTwoFrameCount;
		static const int		_phaseTwoFrameDurationTicks;
		static const int		_phaseTwoRadialProjectileCount;
		static const int		_phaseThreeCooldownTicks;
		static const int		_phaseThreeFrameCount;
		static const int		_phaseThreeFrameDurationTicks;
		static const int		_phaseThreeRadialProjectileCount;
		static const int		_phaseThreeLaserDamage;
		static const float		_phaseThreeLaserSpeed;
		static const float		_phaseThreeLaserSpawnDistance;
		static const double		_phaseThreeFanAngleStep;
		static const double		_phaseTwoFanSpread;
        static const double     _projectileSpread;
};

#endif